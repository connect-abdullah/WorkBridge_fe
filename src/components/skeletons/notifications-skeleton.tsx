"use client";

import { memo } from "react";
import { Skeleton } from "./skeleton-primitives";

function NotificationRowSkeleton() {
  return (
    <div className="w-full rounded-lg border border-border/80 bg-card px-2.5 py-2 shadow-sm sm:rounded-xl sm:px-3 sm:py-2.5">
      <div className="flex gap-2 sm:gap-2.5">
        <Skeleton className="mt-px h-7 w-7 shrink-0 rounded-md sm:h-8 sm:w-8 sm:rounded-lg" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-baseline justify-between gap-2">
            <Skeleton className="h-3.5 w-[68%] max-w-sm rounded sm:h-4" />
            <Skeleton className="h-2.5 w-10 shrink-0 rounded sm:h-3 sm:w-11" />
          </div>
          <Skeleton className="h-3 w-full max-w-md rounded sm:h-3.5" />
          <Skeleton className="h-3 w-[92%] max-w-lg rounded sm:h-3.5" />
        </div>
      </div>
    </div>
  );
}

function GroupSkeleton({ rows }: { rows: number }) {
  return (
    <section className="space-y-1.5 sm:space-y-2">
      <Skeleton className="h-2.5 w-14 rounded sm:h-3 sm:w-16" />
      <ul className="space-y-1.5 sm:space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <li key={i}>
            <NotificationRowSkeleton />
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Matches notifications page: header, toolbar, grouped list. */
export const NotificationsPageSkeleton = memo(
  function NotificationsPageSkeleton() {
    return (
      <div className="mx-auto max-w-2xl space-y-4 pb-6 sm:space-y-5 md:pb-8">
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-40 rounded-lg sm:h-8 sm:w-48" />
          <Skeleton className="h-3 w-full max-w-md rounded sm:h-4 sm:max-w-lg" />
        </div>
        <div className="flex flex-col gap-2 rounded-xl border border-border/80 bg-card px-3 py-2.5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-3.5 sm:py-2.5">
          <Skeleton className="h-3.5 w-24 rounded sm:h-4 sm:w-28" />
          <Skeleton className="h-9 w-full rounded-md sm:h-8 sm:w-32" />
        </div>
        <div className="space-y-5 sm:space-y-6">
          <GroupSkeleton rows={3} />
          <GroupSkeleton rows={2} />
        </div>
      </div>
    );
  },
);
