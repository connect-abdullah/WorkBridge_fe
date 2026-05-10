"use client";

import { memo, useCallback } from "react";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import type { NotificationRead } from "@/lib/apis/notifications/schema";
import {
  formatNotificationTimestamp,
  iconForNotificationType,
  notificationDestinationLabel,
} from "@/components/notifications/notification-utils";

function priorityBadgeMeta(
  priorityRaw: unknown,
): { label: "High" | "Urgent"; className: string } | null {
  const p =
    typeof priorityRaw === "string" ? priorityRaw.trim().toLowerCase() : "";
  if (p === "high") {
    return {
      label: "High",
      className:
        "border-amber-500/25 bg-amber-500/10 text-amber-300 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-300 " +
        "border bg-amber-50 text-amber-700 sm:bg-amber-50 sm:text-amber-700",
    };
  }
  if (p === "urgent") {
    return {
      label: "Urgent",
      className:
        "border-red-500/25 bg-red-500/10 text-red-300 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-300 " +
        "border bg-red-50 text-red-700 sm:bg-red-50 sm:text-red-700",
    };
  }
  return null;
}

export const NotificationListItem = memo(function NotificationListItem({
  notification,
  onActivate,
}: {
  notification: NotificationRead;
  onActivate: (n: NotificationRead) => void;
}) {
  const Icon = iconForNotificationType(notification.notification_type);

  const handleClick = useCallback(() => {
    onActivate(notification);
  }, [notification, onActivate]);

  const destinationLabel = notificationDestinationLabel(notification);

  const navigable = destinationLabel != null;
  const unread = !notification.is_read;
  const priorityBadge = priorityBadgeMeta(notification.priority);

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={
        navigable
          ? `${notification.title}. ${destinationLabel}.`
          : `${notification.title}. Mark as read.`
      }
      className={cn(
        "group w-full rounded-lg border text-left shadow-sm transition duration-200 ease-out",
        "px-2.5 py-2 sm:rounded-xl sm:px-3 sm:py-2.5",
        "motion-reduce:transition-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background sm:focus-visible:ring-offset-2",
        unread
          ? "ring-1 ring-inset ring-primary/25"
          : "ring-0 ring-transparent",
        navigable
          ? "cursor-pointer hover:shadow-md active:scale-[0.995] motion-reduce:active:scale-100"
          : "cursor-default active:scale-[0.998] motion-reduce:active:scale-100",
        notification.is_read
          ? navigable
            ? "border-border/80 bg-card hover:border-primary/30 hover:bg-muted/45"
            : "border-border/80 bg-card/90 hover:border-border hover:bg-muted/40"
          : navigable
            ? "border-primary/25 bg-primary/[0.04] hover:border-primary/40 hover:bg-primary/[0.08] dark:bg-primary/[0.06]"
            : "border-primary/20 bg-primary/[0.04] hover:border-primary/35 hover:bg-primary/[0.07] dark:bg-primary/[0.06]",
      )}
    >
      <div className="flex gap-2 sm:gap-2.5">
        <div
          className={cn(
            "relative mt-px flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors duration-200 sm:h-8 sm:w-8 sm:rounded-lg",
            notification.is_read
              ? "bg-muted/55 text-muted-foreground group-hover:bg-muted"
              : "bg-primary/12 text-primary",
            navigable && "group-hover:text-primary",
          )}
        >
          <Icon className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" aria-hidden />
          {unread ? (
            <span
              className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-primary shadow-sm ring-[1.5px] ring-card sm:h-2 sm:w-2 sm:ring-2"
              aria-hidden
            />
          ) : null}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <div className="min-w-0 flex flex-1 items-baseline gap-1.5">
              <p
                className={cn(
                  "min-w-0 flex-1 text-[11px] leading-tight text-foreground transition-colors duration-200 sm:text-sm sm:leading-snug",
                  unread ? "font-semibold" : "font-medium text-foreground/90",
                  navigable && "group-hover:text-primary",
                )}
              >
                {notification.title}
              </p>
              {priorityBadge ? (
                <span
                  className={cn(
                    "inline-flex shrink-0 items-center rounded-full px-1.5 py-0 text-[9px] font-semibold leading-4 tracking-wide sm:px-2 sm:text-[10px]",
                    "border",
                    priorityBadge.className,
                    unread ? "opacity-90" : "opacity-75",
                  )}
                >
                  {priorityBadge.label}
                </span>
              ) : null}
            </div>
            <time
              dateTime={notification.created_at}
              className="shrink-0 text-right text-[10px] tabular-nums text-muted-foreground/75 sm:text-[11px]"
            >
              {formatNotificationTimestamp(notification.created_at)}
            </time>
          </div>
          <p className="mt-1 text-[11px] leading-snug text-muted-foreground sm:mt-1 sm:text-[13px] sm:leading-relaxed">
            {notification.message}
          </p>
          {destinationLabel ? (
            <p className="mt-1 flex items-center gap-0.5 text-[11px] font-medium text-primary sm:text-xs">
              <span>{destinationLabel}</span>
              <ChevronRight
                className="h-3 w-3 shrink-0 opacity-80 transition duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none sm:h-3.5 sm:w-3.5"
                aria-hidden
              />
            </p>
          ) : null}
        </div>
      </div>
    </button>
  );
});
