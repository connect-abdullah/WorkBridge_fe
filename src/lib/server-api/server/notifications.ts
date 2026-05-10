import "server-only";

import { serverGet } from "@/lib/server-api/server";
import type { APIResponse } from "@/lib/apis/apiResponse";
import type {
  NotificationCountResponse,
  NotificationListResponse,
} from "@/lib/apis/notifications/schema";

export async function fetchNotifications(params?: {
  offset?: number;
  limit?: number;
}): Promise<APIResponse<NotificationListResponse> | null> {
  return serverGet<APIResponse<NotificationListResponse>>("/notifications", {
    params: {
      offset: params?.offset ?? 0,
      limit: params?.limit ?? 20,
    },
    swallow401: true,
  });
}

export async function fetchUnreadNotificationsCount(): Promise<APIResponse<NotificationCountResponse> | null> {
  return serverGet<APIResponse<NotificationCountResponse>>(
    "/notifications/unread-count",
    { swallow401: true },
  );
}
