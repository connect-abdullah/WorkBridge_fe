"use client";

import { ChangeEvent, FormEvent, useCallback, useMemo, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, Link2, Loader2, Paperclip, Send, Upload } from "lucide-react";
import { toast } from "sonner";
import { type ProjectMessage } from "@/constants/project-detail";
import { Button } from "@/components/ui/button";
import {
  appendProjectFileToCache,
  fetchAndCacheProjectFiles,
  uploadProjectFile,
} from "@/lib/apis/files/upload";
import type { APIResponse } from "@/lib/apis/apiResponse";
import type { FileRead } from "@/lib/apis/files/schema";
import { queryKeys } from "@/lib/queryApi";

function fileToken(file: FileRead) {
  return `/${file.file_name}`;
}

function getSlashQuery(value: string) {
  const slashIndex = value.lastIndexOf("/");
  if (slashIndex === -1) return null;
  const before = value[slashIndex - 1];
  if (before && !/\s/.test(before)) return null;
  const query = value.slice(slashIndex + 1);
  if (query.includes("\n")) return null;
  return { slashIndex, query };
}

function MessageWithFileTokens({
  message,
  files,
}: {
  message: string;
  files: ReadonlyArray<FileRead>;
}) {
  const matches = files
    .map((file) => ({ file, token: fileToken(file) }))
    .filter(({ token }) => message.includes(token))
    .sort((a, b) => b.token.length - a.token.length);

  if (matches.length === 0) return <>{message}</>;

  const parts: Array<string | FileRead> = [];
  let remaining = message;
  while (remaining) {
    const next = matches
      .map((m) => ({ ...m, index: remaining.indexOf(m.token) }))
      .filter((m) => m.index !== -1)
      .sort((a, b) => a.index - b.index)[0];

    if (!next) {
      parts.push(remaining);
      break;
    }
    if (next.index > 0) parts.push(remaining.slice(0, next.index));
    parts.push(next.file);
    remaining = remaining.slice(next.index + next.token.length);
  }

  return (
    <>
      {parts.map((part, index) =>
        typeof part === "string" ? (
          <span key={`${part}-${index}`}>{part}</span>
        ) : (
          <span
            key={`${part.id}-${index}`}
            className="mx-0.5 inline-flex max-w-[220px] items-center gap-1 rounded-full bg-background/80 px-2 py-0.5 text-xs font-semibold text-foreground ring-1 ring-border align-middle"
            title={part.file_name}
          >
            <FileText className="h-3 w-3 shrink-0" />
            <span className="truncate">{part.file_name}</span>
          </span>
        ),
      )}
    </>
  );
}

export function MessagesPanel({
  projectId,
  messages,
  messageDraft,
  setMessageDraft,
  onSend,
}: {
  projectId: number;
  messages: ProjectMessage[];
  messageDraft: string;
  setMessageDraft: (v: string) => void;
  onSend: (e: FormEvent<HTMLFormElement>) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const queryClient = useQueryClient();
  const [fileMenuOpen, setFileMenuOpen] = useState(false);
  const [isFetchingFiles, setIsFetchingFiles] = useState(false);
  const [fileListVersion, setFileListVersion] = useState(0);

  const uploadFileMutation = useMutation({
    mutationFn: (file: File) => uploadProjectFile(file, projectId),
  });

  const cachedFiles = useMemo(() => {
    const cached = queryClient.getQueryData<APIResponse<FileRead[]>>(
      queryKeys.files.listByProjectId(projectId),
    );
    return cached?.success === false ? [] : (cached?.data ?? []);
    // fileListVersion forces re-read of the cache after fetch
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, queryClient, uploadFileMutation.isSuccess, fileListVersion]);

  const slashState = getSlashQuery(messageDraft);
  const matchingFiles = useMemo(() => {
    const query = slashState?.query.toLowerCase().trim() ?? "";
    return cachedFiles
      .filter((file) =>
        query ? file.file_name.toLowerCase().includes(query) : true,
      )
      .slice(0, 6);
  }, [cachedFiles, slashState?.query]);

  const insertFileToken = (file: FileRead) => {
    const token = fileToken(file);
    const slash = getSlashQuery(messageDraft);
    const next = slash
      ? `${messageDraft.slice(0, slash.slashIndex)}${token} `
      : `${messageDraft}${messageDraft ? " " : ""}${token} `;
    setMessageDraft(next);
    setFileMenuOpen(false);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const openFileMenu = useCallback(async () => {
    setFileMenuOpen(true);
    if (cachedFiles.length > 0) return;
    setIsFetchingFiles(true);
    try {
      await fetchAndCacheProjectFiles(queryClient, projectId);
      setFileListVersion((v) => v + 1);
    } catch {
      // silently ignore — user can still type to filter
    } finally {
      setIsFetchingFiles(false);
    }
  }, [cachedFiles.length, projectId, queryClient]);

  const onDraftChange = (value: string) => {
    setMessageDraft(value);
    const hasSlash = Boolean(getSlashQuery(value));
    if (hasSlash && !fileMenuOpen) {
      openFileMenu();
    } else if (!hasSlash) {
      setFileMenuOpen(false);
    }
  };

  const onUploadFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const res = await uploadFileMutation.mutateAsync(file);
      if (!res.success || !res.data) {
        toast.error(res.message || "Failed to attach file.");
        return;
      }

      appendProjectFileToCache(queryClient, projectId, res.data);
      queryClient.invalidateQueries({
        queryKey: queryKeys.files.listByProjectId(projectId),
      });
      insertFileToken(res.data);
      toast.success("File attached.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "File upload failed.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex h-[500px] flex-col">
        <div className="border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold text-foreground">Messages</h3>
          <p className="text-xs text-muted-foreground">
            Type / to tag a project file, or attach a new one.
          </p>
        </div>

        <div className="flex-1 space-y-2.5 overflow-y-auto bg-muted/20 p-4">
          {messages.map((item) => (
            <div
              key={item.id}
              className={`flex ${
                item.role === "freelancer" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[68%] rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-sm ${
                  item.role === "freelancer"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-foreground ring-1 ring-border"
                }`}
              >
                <p className="whitespace-pre-wrap break-words">
                  <MessageWithFileTokens
                    message={item.content}
                    files={cachedFiles}
                  />
                </p>
                <p className="mt-1 text-[11px] opacity-70">{item.timestamp}</p>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={onSend} className="relative border-t border-border p-3">
          {fileMenuOpen ? (
            <div className="absolute bottom-[64px] left-3 z-20 w-[min(420px,calc(100%-24px))] overflow-hidden rounded-xl border border-border bg-card shadow-lg">
              <div className="flex items-center justify-between border-b border-border px-3 py-2">
                <span className="text-xs font-medium text-muted-foreground">Files</span>
                {isFetchingFiles ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                ) : null}
              </div>
              {isFetchingFiles && matchingFiles.length === 0 ? (
                <div className="flex items-center gap-2 px-3 py-3 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading files…
                </div>
              ) : matchingFiles.length === 0 ? (
                <div className="px-3 py-3 text-sm text-muted-foreground">
                  No files found for this project.
                </div>
              ) : (
                matchingFiles.map((file) => (
                  <button
                    key={file.id}
                    type="button"
                    onClick={() => insertFileToken(file)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-muted"
                  >
                    {file.file_type === "link" ? (
                      <Link2 className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="min-w-0 flex-1 truncate font-medium text-foreground">
                      {file.file_name}
                    </span>
                    <span className="text-xs capitalize text-muted-foreground">
                      {file.file_type}
                    </span>
                  </button>
                ))
              )}
            </div>
          ) : null}

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={onUploadFile}
          />

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-10 w-10 shrink-0"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadFileMutation.isPending}
              aria-label="Attach file"
            >
              {uploadFileMutation.isPending ? (
                <Upload className="h-4 w-4 animate-pulse" />
              ) : (
                <Paperclip className="h-4 w-4" />
              )}
            </Button>
            <input
              ref={inputRef}
              value={messageDraft}
              onChange={(e) => onDraftChange(e.target.value)}
              onFocus={() => { if (getSlashQuery(messageDraft)) openFileMenu(); }}
              placeholder="Message… type / to tag a file"
              className="h-10 flex-1 rounded-full border border-input bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <Button type="submit" className="h-10 rounded-full px-4">
              <Send className="mr-1.5 h-4 w-4" />
              Send
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
