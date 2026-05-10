"use client";

import { memo } from "react";
import { Skeleton } from "./skeleton-primitives";

/** Mobile payment cards — matches PaymentsListView cards (~h-40). */
export const PaymentsMobileSkeletonList = memo(
  function PaymentsMobileSkeletonList() {
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
  },
);

export const PaymentsTableSkeletonRows = memo(
  function PaymentsTableSkeletonRows({
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
  },
);

/** Full payments route: header + list card (matches payment-page + PaymentsListView). */
export const PaymentsPageSkeleton = memo(function PaymentsPageSkeleton() {
  // Match freelancer desktop table (5 cols); clients gain the Note column when hydrated.
  const colCount = 5;
  return (
    <div className="mx-auto max-w-6xl space-y-6 sm:space-y-8">
      <header className="space-y-2">
        <Skeleton className="h-8 w-52 rounded-lg sm:h-9 sm:w-64" />
        <Skeleton className="h-4 w-full max-w-2xl rounded sm:h-[15px]" />
      </header>
      <section className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
        <div className="flex flex-col gap-3 border-b border-border/80 bg-muted/20 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-56 max-w-full" />
          </div>
          <Skeleton className="h-9 w-40 rounded-lg" />
        </div>
        <div className="p-3 md:hidden">
          <PaymentsMobileSkeletonList />
        </div>
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border/80 bg-muted/25 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3.5">Project / milestone</th>
                <th className="px-4 py-3.5">Amount</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Activity</th>
                <th className="px-4 py-3.5">Actions</th>
              </tr>
            </thead>
            <tbody>
              <PaymentsTableSkeletonRows colCount={colCount} />
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
});

/** Payments tab / embedded table (project detail), five columns. */
export const PaymentsPanelTableSkeleton = memo(
  function PaymentsPanelTableSkeleton() {
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
  },
);
