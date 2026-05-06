"use client";

import { memo } from "react";
import { Skeleton } from "./skeleton-primitives";

/** Mobile payment cards — matches PaymentsListView cards (~h-40). */
export const PaymentsMobileSkeletonList = memo(function PaymentsMobileSkeletonList() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm"
        >
          <div className="flex justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-5 w-4/5 max-w-[200px]" />
              <Skeleton className="h-4 w-3/5 max-w-[160px]" />
            </div>
            <Skeleton className="h-7 w-20 shrink-0 rounded-full" />
          </div>
          <div className="mt-4 space-y-2 border-t border-border/60 pt-3">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-14" />
              <Skeleton className="h-6 w-24" />
            </div>
            <Skeleton className="h-3 w-full max-w-[200px]" />
          </div>
          <div className="mt-3 border-t border-border/60 pt-3">
            <Skeleton className="h-9 w-28" />
          </div>
        </div>
      ))}
    </div>
  );
});

export const PaymentsTableSkeletonRows = memo(function PaymentsTableSkeletonRows({
  colCount,
  rows = 5,
}: {
  colCount: number;
  rows?: number;
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="border-b border-border/40">
          {Array.from({ length: colCount }).map((_, j) => (
            <td key={j} className="px-4 py-4 align-top">
              <Skeleton className="h-4 w-full min-w-[3rem]" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
});

/** Payments tab / embedded table (project detail), five columns. */
export const PaymentsPanelTableSkeleton = memo(function PaymentsPanelTableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="border-t border-border/60">
          <td className="px-4 py-3">
            <Skeleton className="h-4 w-40" />
          </td>
          <td className="px-4 py-3">
            <Skeleton className="h-4 w-16" />
          </td>
          <td className="px-4 py-3">
            <Skeleton className="h-6 w-20 rounded-full" />
          </td>
          <td className="px-4 py-3">
            <Skeleton className="h-4 w-24" />
          </td>
          <td className="px-4 py-3">
            <Skeleton className="h-8 w-20" />
          </td>
        </tr>
      ))}
    </>
  );
});
