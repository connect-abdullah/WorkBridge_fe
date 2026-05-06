"use client";

import { memo } from "react";
import { Skeleton } from "./skeleton-primitives";

/** Activity log table body — matches PaginatedTable layout. */
export const ActivityFeedSkeleton = memo(function ActivityFeedSkeleton() {
  return (
    <section className="rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-16" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-primary/10 dark:bg-muted/40">
            <tr className="border-b border-border">
              {["Activity", "User", "Time"].map((label) => (
                <th
                  key={label}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 6 }).map((_, i) => (
              <tr key={i} className="border-b border-border last:border-b-0">
                <td className="px-4 py-3">
                  <Skeleton className="h-4 w-full max-w-md" />
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <Skeleton className="h-4 w-24" />
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <Skeleton className="h-4 w-28" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end gap-2 border-t border-border px-4 py-3">
        <Skeleton className="h-9 w-20 rounded-md" />
        <Skeleton className="h-9 w-20 rounded-md" />
      </div>
    </section>
  );
});
