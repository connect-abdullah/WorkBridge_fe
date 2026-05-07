"use client";

import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  CheckCheck,
  FileText,
  Image as ImageIcon,
  Link2,
  Loader2,
  Lock,
  Paperclip,
  Send,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  appendProjectFileToCache,
  fetchAndCacheProjectFiles,
  uploadProjectFile,
} from "@/lib/apis/files/upload";
import type { APIResponse } from "@/lib/apis/apiResponse";
import type { FileRead } from "@/lib/apis/files/schema";
import {
  listMessages,
  markMessagesRead,
  sendMessage,
} from "@/lib/apis/messages/messages";
import type {
  MessageRead,
  MessageWsEvent,
} from "@/lib/apis/messages/schema";
import { useChatSocket } from "@/hooks/useChatSocket";
import { getStoredUserId, queryKeys } from "@/lib/queryApi";
import { cn } from "@/lib/utils";
import { MessagesPanelSkeleton } from "@/components/skeletons";
import { Modal } from "./Modal";

type PendingMessage = {
  clientKey: string;
  content: string;
  createdAt: string;
  status: "pending" | "failed";
};

const PAGE_SIZE = 30;

function fileToken(file: FileRead) {
  return `/${file.file_name}`;
}

/** Slash-command picker: `/` at word start + filter text. Not the `/` in an inserted `/file.pdf` token. */
function getSlashQuery(value: string, files: ReadonlyArray<FileRead>) {
  const slashIndex = value.lastIndexOf("/");
  if (slashIndex === -1) return null;
  const before = value[slashIndex - 1];
  if (before && !/\s/.test(before)) return null;
  const query = value.slice(slashIndex + 1);
  if (query.includes("\n")) return null;

  const tail = value.slice(slashIndex);
  const isCompleteFileToken = files.some((f) => {
    const token = fileToken(f);
    if (!tail.startsWith(token)) return false;
    const after = tail[token.length];
    return after === undefined || /\s/.test(after);
  });
  if (isCompleteFileToken) return null;

  return { slashIndex, query };
}

function newClientKey(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `m-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function formatTime(value?: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const IMAGE_EXT = new Set([
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "svg",
  "bmp",
  "avif",
  "ico",
]);

function extensionOf(fileName: string): string {
  const i = fileName.lastIndexOf(".");
  if (i === -1) return "";
  return fileName.slice(i + 1).toLowerCase();
}

/** True when we should open an in-app image preview instead of a new tab. */
function shouldPreviewImageInModal(file: FileRead): boolean {
  if (file.file_type === "link") return false;
  if (file.file_type === "image") return true;
  return IMAGE_EXT.has(extensionOf(file.file_name));
}

function MessageWithFileTokens({
  message,
  files,
  variant,
  onFileClick,
}: {
  message: string;
  files: ReadonlyArray<FileRead>;
  variant: "sent" | "received";
  onFileClick: (file: FileRead) => void;
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

  const capsuleIcon = (file: FileRead) => {
    if (file.file_type === "link") return Link2;
    if (shouldPreviewImageInModal(file)) return ImageIcon;
    return FileText;
  };

  return (
    <>
      {parts.map((part, index) => {
        if (typeof part === "string") {
          return <span key={`${part}-${index}`}>{part}</span>;
        }
        const Icon = capsuleIcon(part);
        return (
          <button
            key={`${part.id}-${index}`}
            type="button"
            onClick={() => onFileClick(part)}
            title={`Open ${part.file_name}`}
            className={cn(
              "mx-0.5 inline-flex max-w-[min(70%,11rem)] cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1 text-left text-xs font-medium align-middle transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 sm:max-w-[min(240px,72vw)]",
              variant === "sent"
                ? "bg-white/20 text-primary-foreground ring-1 ring-white/35 hover:bg-white/28 focus-visible:ring-white/80 focus-visible:ring-offset-primary"
                : "bg-muted/90 text-foreground shadow-sm ring-1 ring-border/70 hover:bg-muted focus-visible:ring-primary/40 focus-visible:ring-offset-background",
            )}
          >
            <Icon className="h-3.5 w-3.5 shrink-0 opacity-90" aria-hidden />
            <span className="min-w-0 truncate">{part.file_name}</span>
          </button>
        );
      })}
    </>
  );
}

export type MessagesPanelAccess = "loading" | "error" | "no_client" | "ready";

export function MessagesPanel({
  projectId,
  access,
}: {
  projectId: number;
  access: MessagesPanelAccess;
}) {
  const messagingEnabled = access === "ready";
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  const currentUserId = getStoredUserId() ?? 0;

  // ── Message state (server-confirmed + locally pending)
  const [messages, setMessages] = useState<MessageRead[]>([]);
  const [pending, setPending] = useState<PendingMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // ── File menu state (preserved from previous panel)
  const [fileMenuOpen, setFileMenuOpen] = useState(false);
  const [isFetchingFiles, setIsFetchingFiles] = useState(false);
  const [fileListVersion, setFileListVersion] = useState(0);

  const [imagePreview, setImagePreview] = useState<{
    url: string;
    name: string;
  } | null>(null);

  const openMessageAttachment = useCallback((file: FileRead) => {
    const url = (file.file_path || "").trim();
    if (!url) {
      toast.error("File is not available yet.");
      return;
    }
    if (file.file_type === "link") {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }
    if (shouldPreviewImageInModal(file)) {
      setImagePreview({ url, name: file.file_name });
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  }, []);

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

  const slashState = getSlashQuery(draft, cachedFiles);
  const matchingFiles = useMemo(() => {
    const query = slashState?.query.toLowerCase().trim() ?? "";
    return cachedFiles
      .filter((file) =>
        query ? file.file_name.toLowerCase().includes(query) : true,
      )
      .slice(0, 6);
  }, [cachedFiles, slashState?.query]);

  // ── Initial fetch (newest page) on mount/project change
  useEffect(() => {
    if (!messagingEnabled || !Number.isFinite(projectId) || projectId <= 0) {
      setIsInitialLoading(false);
      setLoadError(null);
      setMessages([]);
      setPending([]);
      setNextCursor(null);
      return;
    }
    let cancelled = false;
    setIsInitialLoading(true);
    setLoadError(null);
    setMessages([]);
    setNextCursor(null);

    listMessages({ projectId, limit: PAGE_SIZE })
      .then((res) => {
        if (cancelled) return;
        if (!res.success || !res.data) {
          setLoadError(res.message || "Failed to load messages.");
          return;
        }
        setMessages(res.data.items);
        setNextCursor(res.data.next_cursor);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setLoadError(err instanceof Error ? err.message : "Failed to load messages.");
      })
      .finally(() => {
        if (!cancelled) setIsInitialLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [projectId, messagingEnabled]);

  // ── WebSocket: receive incoming messages while panel is mounted
  const handleSocketMessage = useCallback(
    (event: MessageWsEvent) => {
      const msg = event.data;
      if (msg.project_id !== projectId) return;
      setMessages((prev) =>
        prev.some((m) => m.id === msg.id) ? prev : [...prev, msg],
      );
    },
    [projectId],
  );

  useChatSocket({
    enabled:
      messagingEnabled &&
      Number.isFinite(projectId) &&
      projectId > 0,
    onMessage: handleSocketMessage,
  });

  // ── Mark-read: when latest message is from the peer, mark as read
  const lastReadIdRef = useRef<number>(0);
  const markReadMutation = useMutation({
    mutationFn: markMessagesRead,
  });
  useEffect(() => {
    if (!messagingEnabled || messages.length === 0) return;
    const last = messages[messages.length - 1];
    if (
      last.receiver_id !== currentUserId ||
      last.status === "READ" ||
      last.id <= lastReadIdRef.current
    ) {
      return;
    }
    lastReadIdRef.current = last.id;
    markReadMutation.mutate(
      { project_id: projectId, up_to_message_id: last.id },
      {
        onSuccess: () => {
          setMessages((prev) =>
            prev.map((m) =>
              m.receiver_id === currentUserId && m.id <= last.id
                ? { ...m, status: "READ" }
                : m,
            ),
          );
        },
      },
    );
  }, [messagingEnabled, messages, projectId, currentUserId, markReadMutation]);

  // ── Auto-scroll to bottom on new messages
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [messages.length, pending.length]);

  // ── Send (idempotent)
  const sendMutation = useMutation({
    mutationFn: (vars: {
      content: string;
      clientKey: string;
    }) =>
      sendMessage({
        project_id: projectId,
        content: vars.content,
        idempotency_key: vars.clientKey,
      }),
  });

  const submitDraft = (rawContent: string) => {
    if (!messagingEnabled) return;
    const content = rawContent.trim();
    if (!content) return;
    const clientKey = newClientKey();
    const optimistic: PendingMessage = {
      clientKey,
      content,
      createdAt: new Date().toISOString(),
      status: "pending",
    };
    setPending((prev) => [...prev, optimistic]);
    setDraft("");

    sendMutation.mutate(
      { content, clientKey },
      {
        onSuccess: (res) => {
          if (!res.success || !res.data) {
            setPending((prev) =>
              prev.map((p) =>
                p.clientKey === clientKey ? { ...p, status: "failed" } : p,
              ),
            );
            toast.error(res.message || "Failed to send message.");
            return;
          }
          const saved = res.data;
          setMessages((prev) =>
            prev.some((m) => m.id === saved.id) ? prev : [...prev, saved],
          );
          setPending((prev) => prev.filter((p) => p.clientKey !== clientKey));
        },
        onError: (err: unknown) => {
          setPending((prev) =>
            prev.map((p) =>
              p.clientKey === clientKey ? { ...p, status: "failed" } : p,
            ),
          );
          toast.error(err instanceof Error ? err.message : "Failed to send message.");
        },
      },
    );
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    submitDraft(draft);
  };

  const retryPending = (clientKey: string) => {
    const target = pending.find((p) => p.clientKey === clientKey);
    if (!target) return;
    setPending((prev) =>
      prev.map((p) => (p.clientKey === clientKey ? { ...p, status: "pending" } : p)),
    );
    sendMutation.mutate(
      { content: target.content, clientKey },
      {
        onSuccess: (res) => {
          if (!res.success || !res.data) {
            setPending((prev) =>
              prev.map((p) =>
                p.clientKey === clientKey ? { ...p, status: "failed" } : p,
              ),
            );
            toast.error(res.message || "Retry failed.");
            return;
          }
          const saved = res.data;
          setMessages((prev) =>
            prev.some((m) => m.id === saved.id) ? prev : [...prev, saved],
          );
          setPending((prev) => prev.filter((p) => p.clientKey !== clientKey));
        },
        onError: (err: unknown) => {
          setPending((prev) =>
            prev.map((p) =>
              p.clientKey === clientKey ? { ...p, status: "failed" } : p,
            ),
          );
          toast.error(err instanceof Error ? err.message : "Retry failed.");
        },
      },
    );
  };

  const loadOlder = async () => {
    if (nextCursor == null || isLoadingOlder) return;
    setIsLoadingOlder(true);
    try {
      const res = await listMessages({
        projectId,
        cursor: nextCursor,
        limit: PAGE_SIZE,
      });
      if (!res.success || !res.data) {
        toast.error(res.message || "Failed to load older messages.");
        return;
      }
      setMessages((prev) => {
        const existing = new Set(prev.map((m) => m.id));
        const olderUnique = res.data!.items.filter((m) => !existing.has(m.id));
        return [...olderUnique, ...prev];
      });
      setNextCursor(res.data.next_cursor);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load older messages.",
      );
    } finally {
      setIsLoadingOlder(false);
    }
  };

  // ── File menu (kept from previous panel)
  const insertFileToken = (file: FileRead) => {
    const token = fileToken(file);
    const slash = getSlashQuery(draft, cachedFiles);
    const next = slash
      ? `${draft.slice(0, slash.slashIndex)}${token} `
      : `${draft}${draft ? " " : ""}${token} `;
    setDraft(next);
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
    setDraft(value);
    const hasSlash = Boolean(getSlashQuery(value, cachedFiles));
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

  const headerHint =
    access === "no_client"
      ? "Add a client to this project before you can use messages."
      : "Type / to tag a project file, or attach a new one.";

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex h-[min(42rem,calc(100dvh-6rem-env(safe-area-inset-bottom,0px)))] flex-col sm:h-[500px]">
        <div className="shrink-0 border-b border-border px-3 py-2.5 sm:px-4 sm:py-3">
          <h3 className="text-sm font-semibold text-foreground">Messages</h3>
          <p className="text-xs text-muted-foreground">{headerHint}</p>
        </div>

        {messagingEnabled ? (
          <>
        <div
          ref={messagesContainerRef}
          className="min-h-0 flex-1 space-y-2.5 overflow-y-auto bg-muted/20 p-3 sm:p-4"
        >
          {nextCursor != null ? (
            <div className="flex justify-center pb-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={loadOlder}
                disabled={isLoadingOlder}
              >
                {isLoadingOlder ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Loading…
                  </>
                ) : (
                  "Load older messages"
                )}
              </Button>
            </div>
          ) : null}

          {isInitialLoading ? (
            <MessagesPanelSkeleton />
          ) : loadError ? (
            <p className="py-6 text-center text-sm text-destructive">
              {loadError}
            </p>
          ) : messages.length === 0 && pending.length === 0 ? (
            <p className="py-8 text-center text-xs text-muted-foreground">
              No messages yet. Start the conversation.
            </p>
          ) : null}

          {messages.map((item) => {
            const isSelf =
              currentUserId > 0 && item.sender_id === currentUserId;
            return (
              <div
                key={item.id}
                className={`flex w-full ${isSelf ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={cn(
                    "max-w-[min(78%,15rem)] rounded-2xl px-3 py-2 text-sm leading-relaxed sm:max-w-[min(78%,520px)] sm:px-3.5 sm:py-2.5",
                    isSelf
                      ? "rounded-br-md bg-primary text-primary-foreground shadow-md"
                      : "rounded-bl-md border border-border/80 bg-card text-foreground shadow-md ring-1 ring-black/[0.04] dark:ring-white/[0.06]",
                  )}
                >
                  <p
                    className={cn(
                      "whitespace-pre-wrap break-words",
                      isSelf ? "text-primary-foreground" : "text-foreground",
                    )}
                  >
                    <MessageWithFileTokens
                      message={item.content}
                      files={cachedFiles}
                      variant={isSelf ? "sent" : "received"}
                      onFileClick={openMessageAttachment}
                    />
                  </p>
                  <div
                    className={cn(
                      "mt-1.5 flex items-center gap-1 text-[11px]",
                      isSelf ? "justify-end text-primary-foreground/75" : "justify-end text-muted-foreground",
                    )}
                  >
                    <span>{formatTime(item.created_at)}</span>
                    {isSelf ? (
                      item.status === "READ" ? (
                        <CheckCheck className="h-3 w-3" aria-label="Read" />
                      ) : item.status === "DELIVERED" ? (
                        <CheckCheck className="h-3 w-3 opacity-60" aria-label="Delivered" />
                      ) : (
                        <Check className="h-3 w-3 opacity-60" aria-label="Sent" />
                      )
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}

          {pending.map((item) => (
            <div key={item.clientKey} className="flex w-full flex-col items-end gap-1">
              <div
                className={cn(
                  "max-w-[min(78%,15rem)] rounded-2xl rounded-br-md px-3 py-2 text-sm leading-relaxed shadow-md sm:max-w-[min(78%,520px)] sm:px-3.5 sm:py-2.5",
                  item.status === "failed"
                    ? "bg-destructive/10 text-foreground ring-1 ring-destructive/40"
                    : "bg-primary text-primary-foreground",
                )}
              >
                <p className="whitespace-pre-wrap break-words">
                  <MessageWithFileTokens
                    message={item.content}
                    files={cachedFiles}
                    variant="sent"
                    onFileClick={openMessageAttachment}
                  />
                </p>
                <div className="mt-1 flex items-center justify-end gap-2 text-[11px] opacity-80">
                  <span>{formatTime(item.createdAt)}</span>
                  {item.status === "failed" ? (
                    <button
                      type="button"
                      onClick={() => retryPending(item.clientKey)}
                      className="font-medium underline"
                    >
                      Retry
                    </button>
                  ) : null}
                </div>
              </div>
              {item.status === "pending" ? (
                <span className="pr-1 text-[11px] text-muted-foreground">Sending…</span>
              ) : null}
            </div>
          ))}
        </div>

        <form
          onSubmit={onSubmit}
          className="relative shrink-0 border-t border-border p-2 sm:p-3"
        >
          {fileMenuOpen && slashState ? (
            <div className="absolute bottom-[56px] left-2 right-2 z-20 w-auto overflow-hidden rounded-xl border border-border bg-card shadow-lg sm:bottom-[64px] sm:left-3 sm:right-auto sm:w-[min(420px,calc(100%-24px))]">
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

          <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
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
              value={draft}
              onChange={(e) => onDraftChange(e.target.value)}
              onFocus={() => {
                if (getSlashQuery(draft, cachedFiles)) openFileMenu();
              }}
              placeholder="Message… type / to tag a file"
              className="h-10 min-w-0 flex-1 rounded-full border border-input bg-input-background px-3 text-sm text-input-foreground outline-none transition placeholder:text-neutral-500 dark:placeholder:text-neutral-600 focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring/35 sm:px-4"
            />
            <Button
              type="submit"
              className="h-10 shrink-0 rounded-full px-3 sm:px-4"
              disabled={!draft.trim()}
              aria-label="Send message"
            >
              <Send className="h-4 w-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Send</span>
            </Button>
          </div>
        </form>
          </>
        ) : access === "loading" ? (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 bg-muted/20 p-6 text-sm text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading project…
          </div>
        ) : access === "error" ? (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center bg-muted/20 p-6 text-center text-sm text-destructive">
            Could not load project details.
          </div>
        ) : (
          <div className="relative flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto bg-muted/20 p-4 opacity-40">
              <p className="py-8 text-center text-xs text-muted-foreground">
                Messages will be available after a client is assigned to this project.
              </p>
            </div>
            <form
              className="pointer-events-none border-t border-border p-2 opacity-40 sm:p-3"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 shrink-0"
                  disabled
                  aria-hidden
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <input
                  readOnly
                  disabled
                  className="h-10 min-w-0 flex-1 cursor-not-allowed rounded-full border border-input bg-input-background px-3 text-sm text-input-foreground opacity-60 sm:px-4"
                  placeholder="Messaging locked"
                />
                <Button
                  type="button"
                  className="h-10 shrink-0 rounded-full px-3 sm:px-4"
                  disabled
                >
                  <Send className="h-4 w-4 sm:mr-1.5" />
                  <span className="hidden sm:inline">Send</span>
                </Button>
              </div>
            </form>
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/85 p-4 text-center backdrop-blur-[1px]">
              <Lock className="h-9 w-9 text-muted-foreground" aria-hidden />
              <p className="mt-3 text-sm font-medium text-foreground">Messaging is locked</p>
              <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                Assign a client in{" "}
                <span className="font-medium text-foreground">Edit project</span>, then return
                here to send and receive messages.
              </p>
            </div>
          </div>
        )}
      </div>

      <Modal
        open={imagePreview != null}
        onClose={() => setImagePreview(null)}
        title={imagePreview?.name ?? "Image preview"}
        subtitle="Press Escape or click outside to close."
        maxWidth="max-w-4xl"
        zIndexClass="z-[60]"
      >
        {imagePreview ? (
          <div className="flex min-h-[180px] items-center justify-center rounded-lg bg-muted/40 p-3">
            <img
              src={imagePreview.url}
              alt={imagePreview.name}
              className="max-h-[min(72vh,640px)] w-auto max-w-full rounded-md object-contain shadow-sm"
              onError={() => {
                toast.error("Could not load this image.");
                setImagePreview(null);
              }}
            />
          </div>
        ) : null}
      </Modal>
    </section>
  );
}
