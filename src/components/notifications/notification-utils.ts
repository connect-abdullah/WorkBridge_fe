import {
  AlertCircle,
  Bell,
  MessageSquareText,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import type { APIResponse } from "@/lib/apis/apiResponse";
import type {
  NotificationListResponse,
  NotificationRead,
} from "@/lib/apis/notifications/schema";

export type NotificationTimeBucket = "today" | "yesterday" | "earlier";

export function notificationTimeBucket(iso: string): NotificationTimeBucket {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "earlier";
  const now = new Date();
  const startToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const startYesterday = new Date(startToday);
  startYesterday.setDate(startYesterday.getDate() - 1);
  if (d >= startToday) return "today";
  if (d >= startYesterday) return "yesterday";
  return "earlier";
}

export function sortNotificationsNewestFirst(
  items: NotificationRead[],
): NotificationRead[] {
  return [...items].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

export type NotificationGroup = {
  bucket: NotificationTimeBucket;
  label: string;
  items: NotificationRead[];
};

const BUCKET_LABEL: Record<NotificationTimeBucket, string> = {
  today: "Today",
  yesterday: "Yesterday",
  earlier: "Earlier",
};

const BUCKET_ORDER: NotificationTimeBucket[] = [
  "today",
  "yesterday",
  "earlier",
];

type NotifListPage = APIResponse<NotificationListResponse>;

/** Merges paged API results in order, deduping by notification id. */
export function flattenNotificationPages(
  pages: NotifListPage[] | undefined,
): NotificationRead[] {
  if (!pages?.length) return [];
  const seen = new Set<number>();
  const out: NotificationRead[] = [];
  for (const page of pages) {
    if (!page.success || !page.data?.results) continue;
    for (const n of page.data.results) {
      if (seen.has(n.id)) continue;
      seen.add(n.id);
      out.push(n);
    }
  }
  return out;
}

/** Groups by calendar day buckets; items are newest-first within each group. */
export function groupNotificationsForDisplay(
  items: NotificationRead[],
): NotificationGroup[] {
  const sorted = sortNotificationsNewestFirst(items);
  const map: Record<NotificationTimeBucket, NotificationRead[]> = {
    today: [],
    yesterday: [],
    earlier: [],
  };
  for (const n of sorted) {
    map[notificationTimeBucket(n.created_at)].push(n);
  }
  return BUCKET_ORDER.filter((b) => map[b].length > 0).map((bucket) => ({
    bucket,
    label: BUCKET_LABEL[bucket],
    items: map[bucket],
  }));
}

/**
 * `project_id` from API `notification_data` (e.g. message notifications).
 * Returns null if missing or not a positive integer.
 */
export function getNotificationProjectId(
  notification: NotificationRead,
): number | null {
  const id = notification.notification_data?.project_id;
  if (typeof id === "number" && Number.isInteger(id) && id > 0) return id;
  return null;
}

function isInvitationNotification(notification: NotificationRead): boolean {
  const t = notification.notification_type.toLowerCase();
  return t.includes("invit");
}

/** Short CTA label when the row opens a destination (project or action URL). */
export function notificationDestinationLabel(
  notification: NotificationRead,
): string | null {
  const projectId = getNotificationProjectId(notification);
  if (projectId != null) {
    return isInvitationNotification(notification)
      ? "Join the project"
      : "View project";
  }
  if (notification.action_url?.trim()) {
    const label = notification.action_label?.trim();
    return label || "Open";
  }
  return null;
}

export function notificationHasNavigationTarget(
  notification: NotificationRead,
): boolean {
  return notificationDestinationLabel(notification) != null;
}

export function formatNotificationTimestamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const time = d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  const b = notificationTimeBucket(iso);
  if (b === "today") return time;
  if (b === "yesterday") return `Yesterday · ${time}`;
  const now = new Date();
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    ...(d.getFullYear() !== now.getFullYear() ? { year: "numeric" as const } : {}),
  });
}

export function iconForNotificationType(notificationType: string): LucideIcon {
  const t = notificationType.toLowerCase();
  if (t.includes("payment") || t.includes("pay") || t.includes("invoice"))
    return Wallet;
  if (
    t.includes("message") ||
    t.includes("chat") ||
    t.includes("comment")
  )
    return MessageSquareText;
  if (
    t.includes("alert") ||
    t.includes("warn") ||
    t.includes("error") ||
    t.includes("fail")
  )
    return AlertCircle;
  return Bell;
}
