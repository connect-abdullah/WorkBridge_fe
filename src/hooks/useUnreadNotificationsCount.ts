"use client";

import { useQuery } from "@tanstack/react-query";

import type { APIResponse } from "@/lib/apis/apiResponse";
import type { NotificationCountResponse } from "@/lib/apis/notifications/schema";
import { getStoredUserId, queryApi } from "@/lib/queryApi";

function readCount(res: APIResponse<NotificationCountResponse> | undefined) {
  if (!res || res.success === false || !res.data) return 0;
  const c = res.data.count;
  return typeof c === "number" && Number.isFinite(c) && c > 0 ? c : 0;
}

export function useUnreadNotificationsCount() {
  const userId = getStoredUserId() ?? 0;
  return useQuery({
    ...queryApi.notifications.unreadCount(userId),
    select: readCount,
  });
}
