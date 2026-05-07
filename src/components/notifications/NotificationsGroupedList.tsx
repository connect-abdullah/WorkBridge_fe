"use client";

import { memo } from "react";

import type { NotificationRead } from "@/lib/apis/notifications/schema";
import type { NotificationGroup } from "@/components/notifications/notification-utils";
import { NotificationListItem } from "@/components/notifications/NotificationListItem";

export const NotificationsGroupedList = memo(function NotificationsGroupedList({
  groups,
  onItemActivate,
}: {
  groups: NotificationGroup[];
  onItemActivate: (n: NotificationRead) => void;
}) {
  return (
    <div className="space-y-5 sm:space-y-6">
      {groups.map((g) => (
        <section key={g.bucket} className="space-y-1.5 sm:space-y-2">
          <h2 className="px-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-xs">
            {g.label}
          </h2>
          <ul className="space-y-1.5 sm:space-y-2">
            {g.items.map((n) => (
              <li key={n.id}>
                <NotificationListItem
                  notification={n}
                  onActivate={onItemActivate}
                />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
});
