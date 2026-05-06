"use client";

import { memo } from "react";
import { Skeleton } from "./skeleton-primitives";

/** Matches NotesEditor two-column private/shared cards. */
export const NotesEditorSkeleton = memo(function NotesEditorSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {Array.from({ length: 2 }).map((_, i) => (
        <article
          key={i}
          className="space-y-3 rounded-xl border border-border/80 bg-card p-5 shadow-sm"
        >
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-48" />
          <Skeleton className="h-44 w-full rounded-md" />
          <Skeleton className="h-9 w-36 rounded-md" />
        </article>
      ))}
    </div>
  );
});
