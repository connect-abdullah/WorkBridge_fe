"use client";

import { useQuery } from "@tanstack/react-query";

import type { APIResponse } from "@/lib/apis/apiResponse";
import { NOTIFICATIONS_BADGE_LIST_QUERY } from "@/lib/apis/notifications/constants";
import type { NotificationListResponse } from "@/lib/apis/notifications/schema";
import { queryApi } from "@/lib/queryApi";

function countUnread(res: APIResponse<NotificationListResponse> | undefined) {
  if (!res || res.success === false || !res.data?.results) return 0;
  return res.data.results.reduce(
    (acc, n) => acc + (n.is_read ? 0 : 1),
    0,
  );
}

/**
 * Unread count from the same cached list as the notifications page.
 * Count may be a lower bound if there are more than `limit` unread items.
 */
export function useUnreadNotificationsCount() {
  return useQuery({
    ...queryApi.notifications.list(NOTIFICATIONS_BADGE_LIST_QUERY),
    select: countUnread,
  });
}
