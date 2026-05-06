"use client";

import { memo } from "react";
import { Skeleton } from "./skeleton-primitives";

export const FilesListSkeleton = memo(function FilesListSkeleton() {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 p-4">
          <Skeleton className="h-9 w-9 shrink-0 rounded-md" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3 max-w-xs" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
      ))}
    </div>
  );
});
