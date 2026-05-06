"use client";

import { memo } from "react";
import { Skeleton } from "./skeleton-primitives";

/** Matches MessagesPanel scroll area: alternating bubble widths. */
export const MessagesPanelSkeleton = memo(function MessagesPanelSkeleton() {
  return (
    <div className="min-h-0 flex-1 space-y-3 overflow-hidden bg-muted/20 p-3 sm:p-4">
      {Array.from({ length: 8 }).map((_, i) => {
        const outgoing = i % 3 !== 0;
        return (
          <div
            key={i}
            className={`flex w-full ${outgoing ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`space-y-2 rounded-2xl px-3 py-2 sm:px-3.5 sm:py-2.5 ${
                outgoing
                  ? "w-[min(78%,15rem)] bg-primary/20 sm:w-[min(78%,280px)]"
                  : "w-[min(78%,15rem)] border border-border/60 bg-card sm:w-[min(78%,320px)]"
              }`}
            >
              <Skeleton className={`h-3 ${outgoing ? "w-full" : "w-[92%]"}`} />
              <Skeleton className="h-3 w-4/5" />
              <Skeleton className="h-2.5 w-16 opacity-70" />
            </div>
          </div>
        );
      })}
    </div>
  );
});
