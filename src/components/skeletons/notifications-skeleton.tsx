"use client";

import { memo } from "react";
import { Skeleton } from "./skeleton-primitives";

function NotificationRowSkeleton() {
  return (
    <div className="w-full rounded-xl border border-border/80 bg-card p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <Skeleton className="mt-0.5 h-10 w-10 shrink-0 rounded-md" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-4/5 max-w-sm" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
        <Skeleton className="h-3 w-14 shrink-0" />
      </div>
    </div>
  );
}

/** Matches notifications page: toolbar + list. */
export const NotificationsPageSkeleton = memo(function NotificationsPageSkeleton() {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full max-w-lg" />
      </div>
      <div className="flex items-center justify-between rounded-xl border border-border/80 bg-card px-4 py-3 shadow-sm">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-9 w-36 rounded-md" />
      </div>
      <section className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <NotificationRowSkeleton key={i} />
        ))}
      </section>
    </div>
  );
});
