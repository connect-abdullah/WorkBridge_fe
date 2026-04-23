"use client";

import { ComponentType } from "react";
import { cn } from "@/lib/utils";

export function NotificationCard({
  icon: Icon,
  title,
  description,
  timestamp,
  isRead,
  onClick,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-xl border p-4 text-left shadow-sm transition-colors",
        isRead
          ? "border-border bg-card hover:bg-muted/20"
          : "border-primary/25 bg-primary/[0.06] hover:bg-primary/[0.10]",
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "mt-0.5 rounded-md p-2",
            isRead
              ? "bg-muted/40 text-muted-foreground"
              : "bg-primary/10 text-primary",
          )}
        >
          <Icon className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "text-sm text-foreground",
              isRead ? "font-medium" : "font-semibold",
            )}
          >
            {title}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>

        <p className="shrink-0 text-xs text-muted-foreground">{timestamp}</p>
      </div>
    </button>
  );
}
