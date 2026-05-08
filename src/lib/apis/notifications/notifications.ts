import { get, put } from "@/lib/https";
import type { APIResponse } from "@/lib/apis/apiResponse";
import { API_PREFIX } from "@/lib/apis/apiResponse";
import type {
  NotificationCountResponse,
  NotificationListResponse,
  NotificationMarkReadBody,
} from "@/lib/apis/notifications/schema";

/** Collection path without trailing slash (used for sub-resources). */
const NOTIFICATIONS_BASE = `${API_PREFIX}/notifications`;

/**
 * List uses a trailing slash so the request matches FastAPI’s canonical route
 * (`/api/v1/notifications/`) and avoids a 307/308 redirect from `/notifications`.
 */
export async function listNotifications(params?: {
  offset?: number;
  limit?: number;
  is_read?: boolean;
  notification_type?: string;
}) {
  return get<APIResponse<NotificationListResponse>>(`${NOTIFICATIONS_BASE}`, {
    params: {
      offset: params?.offset ?? 0,
      limit: params?.limit ?? 20,
      ...(params?.is_read !== undefined ? { is_read: params.is_read } : {}),
      ...(params?.notification_type
        ? { notification_type: params.notification_type }
        : {}),
    },
  });
}

export async function getUnreadNotificationsCount() {
  return get<APIResponse<NotificationCountResponse>>(
    `${NOTIFICATIONS_BASE}/unread-count`,
  );
}

export async function markNotificationsRead(notification_ids: number[]) {
  return put<APIResponse<NotificationCountResponse>, NotificationMarkReadBody>(
    `${NOTIFICATIONS_BASE}/mark-read`,
    { notification_ids },
  );
}

export async function markAllNotificationsRead() {
  return put<APIResponse<NotificationCountResponse>>(
    `${NOTIFICATIONS_BASE}/mark-all-read`,
  );
}
