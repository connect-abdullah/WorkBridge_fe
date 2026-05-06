"use client";

import { memo } from "react";
import { Skeleton } from "./skeleton-primitives";

function ProjectCardSkeleton() {
  return (
    <article className="rounded-xl border border-border/80 bg-card p-4 shadow-sm">
      <Skeleton className="h-5 w-2/5 max-w-xs" />
      <Skeleton className="mt-2 h-4 w-full max-w-lg" />
      <div className="mt-4 flex flex-col gap-4">
        <div className="flex justify-between">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-10" />
        </div>
        <Skeleton className="h-1.5 w-full rounded-full" />
        <div className="flex flex-wrap gap-3">
          <Skeleton className="h-6 w-28 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <div className="flex justify-between border-t border-border/60 pt-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </article>
  );
}

/** Projects list area (header stays live on page). */
export const ProjectsListSkeleton = memo(function ProjectsListSkeleton() {
  return (
    <section className="flex flex-col space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <ProjectCardSkeleton key={i} />
      ))}
    </section>
  );
});
