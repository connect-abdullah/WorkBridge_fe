"use client";

import { memo } from "react";
import { Skeleton } from "./skeleton-primitives";

/** Matches profile hero + two-column grid; safe-area friendly padding via parent. */
export const ProfilePageSkeleton = memo(function ProfilePageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 sm:space-y-8">
      <section className="relative overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
        <div className="flex flex-col items-center gap-6 p-6 sm:flex-row sm:items-center sm:gap-8 sm:p-8">
          <Skeleton className="h-24 w-24 shrink-0 rounded-2xl sm:h-28 sm:w-28" />
          <div className="min-w-0 flex-1 space-y-3 sm:text-left">
            <Skeleton className="mx-auto h-3 w-24 sm:mx-0" />
            <Skeleton className="mx-auto h-8 w-48 max-w-full sm:mx-0" />
            <Skeleton className="mx-auto h-4 w-64 max-w-full sm:mx-0" />
            <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
              <Skeleton className="h-7 w-24 rounded-full" />
              <Skeleton className="h-7 w-28 rounded-full" />
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-12 lg:gap-8 lg:items-start">
        <div className="space-y-6 lg:col-span-7 xl:col-span-8">
          <section className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm sm:p-6">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="mt-2 h-4 w-full max-w-md" />
            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            </div>
            <div className="mt-6 flex justify-end border-t border-border/80 pt-5">
              <Skeleton className="h-10 w-32 rounded-md" />
            </div>
          </section>
        </div>
        <aside className="space-y-6 lg:col-span-5 xl:col-span-4">
          <section className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm sm:p-6">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="mt-2 h-4 w-full" />
            <div className="mt-4 space-y-3 rounded-xl border border-border/60 bg-muted/20 p-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex justify-between gap-3 py-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
});
