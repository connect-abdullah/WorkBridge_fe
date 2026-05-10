"use client";

import { memo } from "react";
import { Skeleton } from "./skeleton-primitives";

function StatCardSkeleton() {
  return (
    <article className="rounded-xl border border-border/80 bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4 rounded" />
      </div>
      <Skeleton className="h-8 w-20" />
      <Skeleton className="mt-2 h-3 w-32" />
    </article>
  );
}

function DashboardProjectCardSkeleton() {
  return (
    <article className="rounded-xl border border-border/80 bg-card p-4 shadow-sm">
      <Skeleton className="h-5 w-3/5 max-w-xs" />
      <Skeleton className="mt-2 h-4 w-full max-w-md" />
      <Skeleton className="mt-2 h-4 w-4/5 max-w-sm" />
      <div className="mt-4 space-y-2">
        <div className="flex justify-between">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-8" />
        </div>
        <Skeleton className="h-1.5 w-full rounded-full" />
      </div>
      <div className="mt-4 flex justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="space-y-2 text-right">
          <Skeleton className="ml-auto h-3 w-20" />
          <Skeleton className="ml-auto h-4 w-16" />
        </div>
      </div>
    </article>
  );
}

function RecentActivitySkeleton() {
  return (
    <section className="rounded-xl border border-border/80 bg-card p-5 shadow-sm">
      <Skeleton className="h-6 w-36" />
      <div className="mt-4 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="h-10 w-10 shrink-0 rounded-md" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Matches dashboard main content: stats grid + projects + activity sidebar. */
export const DashboardContentSkeleton = memo(
  function DashboardContentSkeleton() {
    return (
      <>
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-4">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <Skeleton className="h-7 w-40" />
              <Skeleton className="h-4 w-28" />
            </div>
            <div className="flex flex-col space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <DashboardProjectCardSkeleton key={i} />
              ))}
            </div>
          </div>
          <RecentActivitySkeleton />
        </section>
      </>
    );
  },
);
