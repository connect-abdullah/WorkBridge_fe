"use client";

import { memo } from "react";
import { Skeleton } from "./skeleton-primitives";

export const ProjectDetailHeaderSkeleton = memo(function ProjectDetailHeaderSkeleton() {
  return (
    <header className="space-y-3 border-b border-border pb-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <Skeleton className="h-9 w-full max-w-md" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-7 w-20 rounded-full" />
          <Skeleton className="h-9 w-20 rounded-full" />
        </div>
      </div>
      <Skeleton className="h-4 w-full max-w-2xl" />
      <Skeleton className="h-4 w-full max-w-xl" />
      <div className="flex flex-wrap gap-6">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-40" />
      </div>
    </header>
  );
});

/** Milestone step tracker card placeholder. */
export const MilestoneStepTrackerSkeleton = memo(function MilestoneStepTrackerSkeleton() {
  return (
    <section className="rounded-xl border border-border/80 bg-card px-6 py-4 shadow-sm">
      <Skeleton className="h-3 w-32" />
      <div className="mt-5 flex items-center gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex flex-1 items-center gap-2">
            <Skeleton className="h-4 w-4 shrink-0 rounded-full" />
            {i < 2 ? <Skeleton className="h-px flex-1" /> : null}
          </div>
        ))}
      </div>
      <div className="mt-3 flex justify-between">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-14" />
      </div>
    </section>
  );
});

export const ProjectDetailTabsSkeleton = memo(function ProjectDetailTabsSkeleton() {
  return (
    <div className="flex gap-1 overflow-x-auto py-1.5">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-9 w-24 shrink-0 rounded-md" />
      ))}
    </div>
  );
});

/** Placeholder under tab bar while project payload loads. */
export const ProjectDetailTabContentSkeleton = memo(
  function ProjectDetailTabContentSkeleton() {
    return (
      <div className="rounded-xl border border-border/80 bg-card p-6 shadow-sm">
        <Skeleton className="h-6 w-48" />
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[80%]" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    );
  },
);
