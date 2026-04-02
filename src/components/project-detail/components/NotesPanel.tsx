"use client";

import { Button } from "@/components/ui/button";

export function NotesPanel({
  privateNotes,
  setPrivateNotes,
  sharedNotes,
  setSharedNotes,
}: {
  privateNotes: string;
  setPrivateNotes: (v: string) => void;
  sharedNotes: string;
  setSharedNotes: (v: string) => void;
}) {
  return (
    <section className="grid gap-4 md:grid-cols-2">
      <article className="space-y-3 rounded-xl border border-border bg-card p-5 shadow-sm">
        <div>
          <h3 className="font-semibold text-foreground">Private Notes</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Only visible to you
          </p>
        </div>
        <textarea
          value={privateNotes}
          onChange={(e) => setPrivateNotes(e.target.value)}
          className="h-52 w-full resize-none rounded-md border border-input bg-background p-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <Button className="h-9">Save Private Notes</Button>
      </article>

      <article className="space-y-3 rounded-xl border border-border bg-card p-5 shadow-sm">
        <div>
          <h3 className="font-semibold text-foreground">Shared Notes</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Visible to all project members
          </p>
        </div>
        <textarea
          value={sharedNotes}
          onChange={(e) => setSharedNotes(e.target.value)}
          className="h-52 w-full resize-none rounded-md border border-input bg-background p-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <Button className="h-9">Save Shared Notes</Button>
      </article>
    </section>
  );
}
