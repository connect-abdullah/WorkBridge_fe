"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2 } from "lucide-react";

import { Modal } from "@/components/project-detail/components/Modal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  acceptProjectClientInvite,
  previewProjectClientInvite,
} from "@/lib/apis/projectInvites/projectInvites";
import { queryKeys } from "@/lib/queryApi";

type Phase = "loading" | "ready" | "joining" | "success" | "error";

export function ProjectClientInviteFromNotificationModal({
  open,
  onClose,
  token,
  fallbackTitle,
}: {
  open: boolean;
  onClose: () => void;
  token: string | null;
  fallbackTitle?: string | null;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [phase, setPhase] = useState<Phase>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDescription, setProjectDescription] = useState<string | null>(null);
  const [joinedProjectId, setJoinedProjectId] = useState<number | null>(null);

  useEffect(() => {
    if (!open || !token) {
      setPhase("loading");
      setErrorMessage(null);
      setProjectTitle("");
      setProjectDescription(null);
      setJoinedProjectId(null);
      return;
    }

    let cancelled = false;
    setPhase("loading");
    setErrorMessage(null);
    setJoinedProjectId(null);

    void (async () => {
      const res = await previewProjectClientInvite({ token });
      if (cancelled) return;
      if (!res.success || !res.data) {
        setPhase("error");
        setErrorMessage(res.message || "Could not load invitation.");
        setProjectTitle(
          typeof fallbackTitle === "string" && fallbackTitle.trim()
            ? fallbackTitle.trim()
            : "Project invitation",
        );
        setProjectDescription(null);
        return;
      }
      setProjectTitle(res.data.title);
      setProjectDescription(
        res.data.description != null && res.data.description !== ""
          ? res.data.description
          : null,
      );
      setPhase("ready");
    })();

    return () => {
      cancelled = true;
    };
  }, [open, token, fallbackTitle]);

  const modalTitle = useMemo(() => {
    if (phase === "success") return "You're in";
    if (phase === "error" && !projectTitle) return "Invitation";
    if (phase === "joining") return "Joining project";
    if (phase === "loading") return "Project invitation";
    return "Project invitation";
  }, [phase, projectTitle]);

  const handleJoin = useCallback(async () => {
    if (!token) return;
    setPhase("joining");
    setErrorMessage(null);
    const res = await acceptProjectClientInvite({ token });
    if (!res.success || !res.data) {
      setPhase("error");
      setErrorMessage(res.message || "Could not join this project.");
      return;
    }
    await queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    setJoinedProjectId(res.data.id);
    setPhase("success");
  }, [token, queryClient]);

  const handleGoToProject = useCallback(() => {
    if (joinedProjectId != null) {
      router.push(`/projects/${joinedProjectId}`);
    }
    onClose();
  }, [joinedProjectId, router, onClose]);

  const handleBackdropClose = useCallback(() => {
    if (phase === "joining") return;
    onClose();
  }, [phase, onClose]);

  if (!token) return null;

  return (
    <Modal
      open={open}
      onClose={handleBackdropClose}
      title={modalTitle}
      subtitle={
        phase === "loading"
          ? "Loading project details…"
          : phase === "ready"
            ? "Review the project, then join when you're ready."
            : phase === "joining"
              ? "Please wait…"
              : phase === "success"
                ? "This project is now on your account."
                : undefined
      }
      maxWidth="max-w-md"
      zIndexClass="z-[100]"
    >
      <div className="flex flex-col gap-4">
        {phase === "loading" ? (
          <div className="flex flex-col items-center justify-center gap-3 py-6">
            <Loader2
              className="h-8 w-8 animate-spin text-muted-foreground"
              aria-hidden
            />
          </div>
        ) : null}

        {phase === "ready" ? (
          <>
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">{projectTitle}</p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {projectDescription ?? "No description provided."}
              </p>
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="h-11 sm:w-auto"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button type="button" className="h-11 sm:w-auto" onClick={handleJoin}>
                Join project
              </Button>
            </div>
          </>
        ) : null}

        {phase === "joining" ? (
          <div className="flex flex-col items-center justify-center gap-3 py-8">
            <Loader2
              className="h-8 w-8 animate-spin text-muted-foreground"
              aria-hidden
            />
            <p className="text-sm text-muted-foreground">Joining project…</p>
          </div>
        ) : null}

        {phase === "success" ? (
          <div className="flex flex-col items-center gap-4 py-2">
            <div
              className={cn(
                "flex h-14 w-14 items-center justify-center rounded-full",
                "bg-primary/10 text-primary",
              )}
            >
              <CheckCircle2 className="h-8 w-8" aria-hidden />
            </div>
            <p className="text-center text-sm text-muted-foreground">
              You can open the project workspace whenever you like.
            </p>
            <Button
              type="button"
              className="h-11 w-full sm:w-auto"
              onClick={handleGoToProject}
            >
              Go to project
            </Button>
          </div>
        ) : null}

        {phase === "error" ? (
          <div className="space-y-4">
            <p className="text-sm text-destructive">{errorMessage}</p>
            <div className="flex justify-end">
              <Button type="button" variant="outline" className="h-11" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
