"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createNote, updateNote } from "@/lib/apis/notes/notes";
import type { NoteRead } from "@/lib/apis/notes/schema";
import type { NoteCreate, NoteUpdate } from "@/lib/apis/notes/schema";
import { getStoredUserId, queryApi, queryKeys } from "@/lib/queryApi";

export function NotesEditor({
  projectId,
  meetingId,
  scope,
}: {
  projectId: number;
  meetingId?: number | null;
  scope: "project" | "meeting";
}) {
  const { data: res, isLoading, error } = useQuery(
    queryApi.notes.list(projectId, meetingId, {
      staleTime: 2 * 60 * 1000, // 2 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    }),
  );

  const queryClient = useQueryClient();
  const userId = getStoredUserId() ?? 0;

  const bucket = useMemo(() => {
    if (scope === "meeting") {
      return res?.data?.meeting ?? null;
    }
    return res?.data?.project ?? null;
  }, [res?.data?.meeting, res?.data?.project, scope]);

  const privateNote: NoteRead | null = bucket?.private ?? null;
  const sharedNote: NoteRead | null = bucket?.shared ?? null;

  const [privateValue, setPrivateValue] = useState("");
  const [sharedValue, setSharedValue] = useState("");
  const [privateDirty, setPrivateDirty] = useState(false);
  const [sharedDirty, setSharedDirty] = useState(false);

  useEffect(() => {
    if (!privateDirty) setPrivateValue(privateNote?.content ?? "");
    if (!sharedDirty) setSharedValue(sharedNote?.content ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [privateNote?.id, sharedNote?.id]);

  const savePrivateMutation = useMutation({
    mutationFn: async (): Promise<unknown> => {
      const content = privateValue;
      if (privateNote?.id) {
        const payload: NoteUpdate = { content };
        return updateNote(privateNote.id, payload);
      }
      const payload: NoteCreate = {
        content,
        type: "private",
        project_id: projectId,
        user_id: userId,
        meeting_id: scope === "meeting" ? meetingId ?? undefined : undefined,
      };
      return createNote(payload);
    },
    onSuccess: async (r) => {
      const api = r as { success?: boolean; message?: string };
      if (api?.success === false) {
        toast.error(api.message || "Failed to save.");
        return;
      }
      toast.success(api?.message || "Saved.");
      setPrivateDirty(false);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.notes.list(projectId, meetingId),
      });
    },
  });

  const saveSharedMutation = useMutation({
    mutationFn: async (): Promise<unknown> => {
      const content = sharedValue;
      if (sharedNote?.id) {
        const payload: NoteUpdate = { content };
        return updateNote(sharedNote.id, payload);
      }
      const payload: NoteCreate = {
        content,
        type: "shared",
        project_id: projectId,
        user_id: userId,
        meeting_id: scope === "meeting" ? meetingId ?? undefined : undefined,
      };
      return createNote(payload);
    },
    onSuccess: async (r) => {
      const api = r as { success?: boolean; message?: string };
      if (api?.success === false) {
        toast.error(api.message || "Failed to save.");
        return;
      }
      toast.success(api?.message || "Saved.");
      setSharedDirty(false);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.notes.list(projectId, meetingId),
      });
    },
  });

  if (scope === "meeting" && !meetingId) {
    return (
      <p className="text-sm text-muted-foreground">
        Select a meeting to view meeting notes.
      </p>
    );
  }

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading notes…</p>;
  }

  if (error) {
    return (
      <p className="text-sm text-destructive">
        {error.message || "Failed to load notes."}
      </p>
    );
  }

  if (!res) {
    return <p className="text-sm text-muted-foreground">No notes.</p>;
  }

  if (res.success === false) {
    return (
      <p className="text-sm text-destructive">
        {res.message || "Failed to load notes."}
      </p>
    );
  }

  if (!res.data) {
    return <p className="text-sm text-muted-foreground">No notes.</p>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <article className="space-y-3 rounded-xl border border-border bg-card p-5 shadow-sm">
        <div>
          <h4 className="font-semibold text-foreground">Private Notes</h4>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Only visible to you
          </p>
        </div>
        <textarea
          value={privateValue}
          onChange={(e) => {
            setPrivateValue(e.target.value);
            setPrivateDirty(true);
          }}
          className="h-44 w-full resize-none rounded-md border border-input bg-background p-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          placeholder="Your private notes…"
        />
        <Button
          type="button"
          className="h-9"
          onClick={() => savePrivateMutation.mutate()}
          disabled={savePrivateMutation.isPending}
        >
          {savePrivateMutation.isPending ? "Saving..." : "Save Private Notes"}
        </Button>
      </article>

      <article className="space-y-3 rounded-xl border border-border bg-card p-5 shadow-sm">
        <div>
          <h4 className="font-semibold text-foreground">Shared Notes</h4>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Visible to all project members
          </p>
        </div>
        <textarea
          value={sharedValue}
          onChange={(e) => {
            setSharedValue(e.target.value);
            setSharedDirty(true);
          }}
          className="h-44 w-full resize-none rounded-md border border-input bg-background p-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          placeholder="Shared notes…"
        />
        <Button
          type="button"
          className="h-9"
          onClick={() => saveSharedMutation.mutate()}
          disabled={saveSharedMutation.isPending}
        >
          {saveSharedMutation.isPending ? "Saving..." : "Save Shared Notes"}
        </Button>
      </article>
    </div>
  );
}

