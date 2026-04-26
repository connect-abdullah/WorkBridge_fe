"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  Download,
  Trash2,
  X,
  Pencil,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Link2,
  FileArchive,
  Sheet,
  File as FileIcon,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { inputCls } from "@/components/ui/form-field";
import { AlertModal } from "@/components/ui/alert-modal";
import { queryApi, queryKeys } from "@/lib/queryApi";
import type { FileCreate, FileRead, FileUpdate } from "@/lib/apis/files/schema";
import {
  appendProjectFileToCache,
  fetchAndCacheProjectFiles,
  getUploadedUserType,
  inferFileType,
  uploadProjectFile,
} from "@/lib/apis/files/upload";
import { updateFile } from "@/lib/apis/files/files";
import { Modal } from "@/components/project-detail/components/Modal";

function splitFileName(value: string): { base: string; ext: string } {
  const v = (value || "").trim();
  if (!v) return { base: "", ext: "" };
  const lastDot = v.lastIndexOf(".");
  if (lastDot <= 0 || lastDot === v.length - 1) return { base: v, ext: "" };
  return { base: v.slice(0, lastDot), ext: v.slice(lastDot) };
}

function getFileRowIcon(file: FileRead) {
  const type = (file.file_type || "").toLowerCase();
  if (type === "link") return Link2;
  if (type === "image") return ImageIcon;
  if (type === "video") return Video;
  if (type === "audio") return Music;
  if (type === "document") return FileText;

  const ext = splitFileName(file.file_name || "").ext.toLowerCase();
  if (ext === ".pdf" || ext === ".doc" || ext === ".docx" || ext === ".txt")
    return FileText;
  if (ext === ".xls" || ext === ".xlsx" || ext === ".csv") return Sheet;
  if (ext === ".zip" || ext === ".rar" || ext === ".7z") return FileArchive;
  if (ext === ".png" || ext === ".jpg" || ext === ".jpeg" || ext === ".webp")
    return ImageIcon;
  if (ext === ".mp4" || ext === ".mov" || ext === ".mkv") return Video;
  if (ext === ".mp3" || ext === ".wav" || ext === ".m4a") return Music;

  return FileIcon;
}

function toValidUrl(value: string): string | null {
  const raw = (value || "").trim();
  if (!raw) return null;
  try {
    const u = new URL(raw);
    if (!u.protocol || (u.protocol !== "http:" && u.protocol !== "https:")) {
      return null;
    }
    return u.toString();
  } catch {
    return null;
  }
}

function formatDate(value: unknown): string {
  if (!value) return "—";
  const d = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

export function FilesPanel({
  projectId,
}: {
  projectId: number;
}) {
  const updateTitleId = useId();
  const linkTitleId = useId();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const queryClient = useQueryClient();
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [updateTarget, setUpdateTarget] = useState<FileRead | null>(null);
  const [updateValue, setUpdateValue] = useState("");
  const [updateExt, setUpdateExt] = useState("");
  const [updateLinkValue, setUpdateLinkValue] = useState("");
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkName, setLinkName] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<FileRead | null>(null);

  const filesQuery = useQuery(
    queryApi.files.listByProjectId(projectId, {
      staleTime: 30 * 60 * 1000, // 30 minutes
      gcTime: 60 * 60 * 1000, // 1 hour
    }),
  );

  const createFileMutation = useMutation(queryApi.mutations.files.create());
  const uploadFileMutation = useMutation({
    mutationFn: (file: File) => uploadProjectFile(file, projectId),
  });
  const deleteFileMutation = useMutation(queryApi.mutations.files.delete());
  const updateFileMutation = useMutation({
    mutationFn: async (payload: { fileId: number; data: FileUpdate }) =>
      updateFile(payload.fileId, payload.data),
  });

  const deleteRow = async (file: FileRead) => {
    try {
      const res = await deleteFileMutation.mutateAsync({ fileId: file.id });
      if (!res.success) {
        toast.error(res.message || "Failed to delete file.");
        return;
      }
      toast.success(res.message || "Deleted.");
      queryClient.invalidateQueries({
        queryKey: queryKeys.files.listByProjectId(projectId),
      });
    } catch (err) {
      const maybeDetail =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (err as any)?.response?.data?.detail ??
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (err as any)?.response?.data?.message;
      if (Array.isArray(maybeDetail) && maybeDetail[0]?.msg) {
        toast.error(String(maybeDetail[0].msg));
      } else if (typeof maybeDetail === "string") {
        toast.error(maybeDetail);
      } else {
        toast.error(err instanceof Error ? err.message : "Delete failed.");
      }
    }
  };

  const rows = useMemo(() => {
    const data = filesQuery.data;
    if (!data || data.success === false) return [] as FileRead[];
    return (data.data ?? []) as FileRead[];
  }, [filesQuery.data]);

  useEffect(() => {
    if (!pendingFile) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      return;
    }
    if (pendingFile.type?.toLowerCase().startsWith("image/")) {
      const url = URL.createObjectURL(pendingFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  }, [pendingFile]);

  // Update/Add-link modals use the shared `Modal` component, which handles
  // scroll locking + Escape-to-close centrally.

  const openUpdateModal = (file: FileRead) => {
    setUpdateTarget(file);
    if (file.file_type === "link") {
      setUpdateValue(file.file_name || "");
      setUpdateExt("");
      setUpdateLinkValue(file.file_path || "");
    } else {
      const { base, ext } = splitFileName(file.file_name || "");
      setUpdateValue(base);
      setUpdateExt(ext);
      setUpdateLinkValue("");
    }
    setUpdateOpen(true);
  };

  const submitUpdate = async () => {
    if (!updateTarget) return;
    const nextBase = updateValue.trim();
    const nextName =
      updateTarget.file_type === "link"
        ? nextBase
        : `${nextBase}${updateExt || ""}`;
    if (!nextName) {
      toast.error("File name is required.");
      return;
    }

    try {
      const nextData: FileUpdate = { file_name: nextName };
      if (updateTarget.file_type === "link") {
        const nextUrl = toValidUrl(updateLinkValue);
        if (!nextUrl) {
          toast.error("A valid link is required.");
          return;
        }
        nextData.file_path = nextUrl;
      }

      const res = await updateFileMutation.mutateAsync({
        fileId: updateTarget.id,
        data: nextData,
      });

      if (!res.success) {
        toast.error(res.message || "Failed to update file.");
        return;
      }

      toast.success(res.message || "File updated.");
      setUpdateOpen(false);
      setUpdateTarget(null);
      setUpdateLinkValue("");
      queryClient.invalidateQueries({
        queryKey: queryKeys.files.listByProjectId(projectId),
      });
    } catch (err) {
      const maybeDetail =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (err as any)?.response?.data?.detail ??
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (err as any)?.response?.data?.message;
      if (Array.isArray(maybeDetail) && maybeDetail[0]?.msg) {
        toast.error(String(maybeDetail[0].msg));
      } else if (typeof maybeDetail === "string") {
        toast.error(maybeDetail);
      } else {
        toast.error(err instanceof Error ? err.message : "Rename failed.");
      }
    }
  };

  const openLinkModal = () => {
    setLinkName("");
    setLinkUrl("");
    setLinkOpen(true);
  };

  const submitLink = async () => {
    const name = linkName.trim();
    const url = toValidUrl(linkUrl);
    if (!name) {
      toast.error("Link name is required.");
      return;
    }
    if (!url) {
      toast.error("A valid link is required.");
      return;
    }

    try {
      const payload: FileCreate = {
        file_name: name,
        file_path: url,
        file_type: "link",
        uploaded_user: getUploadedUserType(),
        project_id: projectId,
      };

      const res = await createFileMutation.mutateAsync(payload);
      if (!res.success) {
        toast.error(res.message || "Failed to save link.");
        return;
      }

      toast.success(res.message || "Link added.");
      setLinkOpen(false);
      queryClient.invalidateQueries({
        queryKey: queryKeys.files.listByProjectId(projectId),
      });
    } catch (err) {
      const maybeDetail =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (err as any)?.response?.data?.detail ??
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (err as any)?.response?.data?.message;
      if (Array.isArray(maybeDetail) && maybeDetail[0]?.msg) {
        toast.error(String(maybeDetail[0].msg));
      } else if (typeof maybeDetail === "string") {
        toast.error(maybeDetail);
      } else {
        toast.error(err instanceof Error ? err.message : "Failed to add link.");
      }
    }
  };

  const downloadFile = async (file: FileRead) => {
    const url = (file.file_path || "").trim();
    if (!url) {
      toast.error("Invalid file path.");
      return;
    }

    try {
      const res = await fetch(url);
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(
          `Download failed (${res.status}).${body ? ` ${body}` : ""}`,
        );
      }
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = file.file_name || "download";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Download failed.");
    }
  };

  const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;
      setPendingFile(file);
    } catch (err) {
      const maybeDetail =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (err as any)?.response?.data?.detail ??
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (err as any)?.response?.data?.message;
      if (Array.isArray(maybeDetail) && maybeDetail[0]?.msg) {
        toast.error(String(maybeDetail[0].msg));
      } else if (typeof maybeDetail === "string") {
        toast.error(maybeDetail);
      } else {
        toast.error(err instanceof Error ? err.message : "File upload failed.");
      }
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const cancelPending = () => {
    setPendingFile(null);
  };

  const uploadPending = async () => {
    if (!pendingFile) return;
    try {
      const res = await uploadFileMutation.mutateAsync(pendingFile);
      if (!res.success) {
        toast.error(res.message || "Failed to save file.");
        return;
      }

      if (res.data) {
        appendProjectFileToCache(queryClient, projectId, res.data);
      }
      toast.success(res.message || "File uploaded.");
      setPendingFile(null);
      queryClient.invalidateQueries({
        queryKey: queryKeys.files.listByProjectId(projectId),
      });
    } catch (err) {
      const maybeDetail =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (err as any)?.response?.data?.detail ??
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (err as any)?.response?.data?.message;
      if (Array.isArray(maybeDetail) && maybeDetail[0]?.msg) {
        toast.error(String(maybeDetail[0].msg));
      } else if (typeof maybeDetail === "string") {
        toast.error(maybeDetail);
      } else {
        toast.error(err instanceof Error ? err.message : "File upload failed.");
      }
    }
  };

  return (
    <section className="space-y-4">
      <AlertModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete file?"
        description={
          deleteTarget
            ? `Delete "${deleteTarget.file_name}"? This can’t be undone.`
            : undefined
        }
        actionBgClass="bg-red-600"
        actionBorderClass="border-red-600"
        actionTextClass="text-white"
        actionLabel="Delete"
        onAction={async () => {
          if (!deleteTarget) return;
          const target = deleteTarget;
          setDeleteTarget(null);
          await deleteRow(target);
        }}
        isPending={deleteFileMutation.isPending}
      />

      <Modal
        open={updateOpen}
        onClose={() => setUpdateOpen(false)}
        title="Update"
        titleId={updateTitleId}
        maxWidth="max-w-lg"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Name</label>
            <input
              className={inputCls}
              value={updateValue}
              onChange={(e) => setUpdateValue(e.target.value)}
              placeholder="Enter name"
              autoFocus
            />
          </div>

          {updateTarget?.file_type === "link" ? (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Link
              </label>
              <input
                className={inputCls}
                value={updateLinkValue}
                onChange={(e) => setUpdateLinkValue(e.target.value)}
                placeholder="https://example.com"
              />
            </div>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="h-11 sm:w-28"
              onClick={() => setUpdateOpen(false)}
              disabled={updateFileMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="h-11 sm:w-28"
              onClick={submitUpdate}
              disabled={updateFileMutation.isPending}
            >
              {updateFileMutation.isPending ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={linkOpen}
        onClose={() => setLinkOpen(false)}
        title="Add a link"
        titleId={linkTitleId}
        maxWidth="max-w-lg"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Name</label>
            <input
              className={inputCls}
              value={linkName}
              onChange={(e) => setLinkName(e.target.value)}
              placeholder="Enter name"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Link</label>
            <input
              className={inputCls}
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="h-11 sm:w-28"
              onClick={() => setLinkOpen(false)}
              disabled={createFileMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="h-11 sm:w-28"
              onClick={submitLink}
              disabled={createFileMutation.isPending}
            >
              {createFileMutation.isPending ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      </Modal>

      <input
        ref={fileInputRef as React.RefObject<HTMLInputElement>}
        type="file"
        multiple={false}
        className="hidden"
        onChange={onFileSelected}
      />

      <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center shadow-sm">
        {!pendingFile ? (
          <>
            <p className="font-medium text-foreground">
              Drag and drop files here
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Upload project assets, briefs, and deliverables
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <Button variant="outline" className="h-9" onClick={openLinkModal}>
                Add a link
              </Button>
              <Button
                variant="outline"
                className="h-9"
                onClick={() => fileInputRef.current?.click()}
              >
                Upload Files
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-3 text-left">
            <div className="flex items-center gap-3 rounded-lg border border-border bg-background/40 p-3">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Selected file preview"
                  className="h-12 w-12 rounded-md object-cover border border-border bg-muted"
                />
              ) : (
                <div className="h-12 w-12 rounded-md border border-border bg-muted" />
              )}

              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-foreground">
                  {pendingFile.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {inferFileType(pendingFile.type).toUpperCase()} •{" "}
                  {(pendingFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>

              <button
                type="button"
                onClick={cancelPending}
                className="rounded-md p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                aria-label="Remove selected file"
                disabled={uploadFileMutation.isPending}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                className="h-9"
                onClick={uploadPending}
                disabled={uploadFileMutation.isPending}
              >
                {uploadFileMutation.isPending ? "Uploading…" : "Upload"}
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        {filesQuery.isLoading ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            Loading files…
          </p>
        ) : filesQuery.error ? (
          <p className="px-4 py-8 text-center text-sm text-destructive">
            {(filesQuery.error as Error).message || "Failed to load files."}
          </p>
        ) : rows.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            No files uploaded yet.
          </p>
        ) : (
          <>
            <div className="grid min-w-[680px] items-center gap-3 border-b border-border bg-muted/30 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:grid-cols-[1.4fr_0.6fr_0.9fr_0.9fr_auto]">
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm border border-border bg-muted/40 opacity-0"
                  aria-hidden="true"
                />
                <span className="min-w-0 truncate">Name</span>
              </div>
              <span>Type</span>
              <span>Uploaded Date</span>
              <span>Uploaded By</span>
              <div className="flex justify-end">
                <span>Actions</span>
              </div>
            </div>

            {rows.map((file, i) => (
              <div
                key={String(file.id)}
                className={`grid min-w-[680px] items-center gap-3 px-4 py-3 text-sm md:grid-cols-[1.4fr_0.6fr_0.9fr_0.9fr_auto] ${
                  i !== rows.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <div className="flex min-w-0 items-center gap-2">
                  {(() => {
                    const Icon = getFileRowIcon(file);
                    return (
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm border border-border bg-muted/40 text-muted-foreground">
                        <Icon className="h-4 w-4" />
                      </span>
                    );
                  })()}
                  <p className="min-w-0 truncate font-medium text-foreground">
                    {file.file_name}
                  </p>
                </div>
                <p className="text-muted-foreground capitalize">{file.file_type}</p>
                <p className="text-muted-foreground">
                  {formatDate((file as any).created_at)}
                </p>
                <p className="text-muted-foreground capitalize">
                  {file.uploaded_user}
                </p>
                <div className="flex items-center justify-end gap-1.5">
                {/* {file.file_type === "image" && (
                  <button
                    type="button"
                    className="rounded-md p-1.5 text-muted-foreground transition hover:bg-muted hover:text-primary"
                    aria-label={`Preview ${file.file_name}`}
                    onClick={() => window.open(file.file_path, "_blank", "noopener,noreferrer")}
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                )}
            */}
                <button
                  type="button"
                  className="rounded-md p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  aria-label={
                    file.file_type === "link"
                      ? `Go to ${file.file_name}`
                      : `Download ${file.file_name}`
                  }
                  onClick={() => {
                    if (file.file_type === "link") {
                      const url = toValidUrl(file.file_path);
                      if (!url) {
                        toast.error("Invalid link.");
                        return;
                      }
                      window.open(url, "_blank", "noopener,noreferrer");
                      return;
                    }
                    downloadFile(file);
                  }}
                >
                  {file.file_type === "link" ? (
                    <ExternalLink className="h-4 w-4" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                </button>
                <button
                  type="button"
                  className="rounded-md p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  aria-label={`Edit ${file.file_name}`}
                  onClick={() => openUpdateModal(file)}
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(file)}
                  className="rounded-md p-1.5 text-muted-foreground transition hover:bg-muted hover:text-destructive"
                  aria-label={`Delete ${file.file_name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              </div>
            ))}
          </>
        )}
      </div>
    </section>
  );
}
