/** Backend notification types vary; keep as string for forward compatibility. */
export type NotificationType = string;

export type NotificationPriority = string;

export interface NotificationRead {
  id: number;
  user_id: number;
  notification_type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  action_url?: string | null;
  action_label?: string | null;
  notification_data?: Record<string, unknown> | null;
  is_read: boolean;
  read_at?: string | null;
  created_at: string;
}

export interface NotificationListResponse {
  results: NotificationRead[];
  total: number;
  offset: number;
  limit: number;
}

export interface NotificationCountResponse {
  count: number;
  message?: string;
}

export interface NotificationMarkReadBody {
  notification_ids: number[];
}
