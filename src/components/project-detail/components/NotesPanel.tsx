"use client";

import { NotesEditor } from "./NotesEditor";

export function NotesPanel({
  projectId,
  meetingId,
}: {
  projectId: number;
  meetingId?: number | null;
}) {
  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <NotesEditor projectId={projectId} meetingId={undefined} scope="project" />
      </div>

      {meetingId ? (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Meeting</h3>
          <NotesEditor projectId={projectId} meetingId={meetingId} scope="meeting" />
        </div>
      ) : null}
    </section>
  );
}
