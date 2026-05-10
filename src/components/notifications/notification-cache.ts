import type { QueryClient, QueryKey } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";

import type { APIResponse } from "@/lib/apis/apiResponse";
import type {
  NotificationCountResponse,
  NotificationListResponse,
} from "@/lib/apis/notifications/schema";

export type NotificationListQueryData = APIResponse<NotificationListResponse>;
export type NotificationInfiniteQueryData =
  InfiniteData<NotificationListQueryData>;
export type NotificationUnreadCountQueryData =
  APIResponse<NotificationCountResponse>;

export type NotificationCachesSnapshot = {
  infinite: NotificationInfiniteQueryData | undefined;
  unreadCount: NotificationUnreadCountQueryData | undefined;
};

type ReadPatch = { ids: number[] } | { all: true };

export function applyReadToPage(
  page: NotificationListQueryData,
  opts: ReadPatch,
): NotificationListQueryData {
  if (!page.success || !page.data?.results) return page;
  const now = new Date().toISOString();
  return {
    ...page,
    data: {
      ...page.data,
      results: page.data.results.map((r) => {
        const match = "all" in opts ? true : opts.ids.includes(r.id);
        if (!match) return r;
        return { ...r, is_read: true, read_at: r.read_at ?? now };
      }),
    },
  };
}

export function mapInfiniteReadPages(
  data: NotificationInfiniteQueryData | undefined,
  opts: ReadPatch,
): NotificationInfiniteQueryData | undefined {
  if (!data) return data;
  return {
    ...data,
    pages: data.pages.map((p) => applyReadToPage(p, opts)),
  };
}

export function readNotificationCachesSnapshot(
  queryClient: QueryClient,
  infiniteKey: QueryKey,
  unreadCountKey: QueryKey,
): NotificationCachesSnapshot {
  return {
    infinite:
      queryClient.getQueryData<NotificationInfiniteQueryData>(infiniteKey),
    unreadCount:
      queryClient.getQueryData<NotificationUnreadCountQueryData>(
        unreadCountKey,
      ),
  };
}

function patchUnreadCount(
  old: NotificationUnreadCountQueryData | undefined,
  opts: ReadPatch,
): NotificationUnreadCountQueryData | undefined {
  if (!old || old.success === false || !old.data) return old;
  const prev = old.data.count;
  if (typeof prev !== "number" || !Number.isFinite(prev) || prev <= 0)
    return old;
  const next = "all" in opts ? 0 : Math.max(0, prev - (opts.ids?.length ?? 0));
  if (next === prev) return old;
  return { ...old, data: { ...old.data, count: next } };
}

export function writeOptimisticMarkRead(
  queryClient: QueryClient,
  infiniteKey: QueryKey,
  unreadCountKey: QueryKey,
  opts: ReadPatch,
) {
  queryClient.setQueryData<NotificationInfiniteQueryData | undefined>(
    infiniteKey,
    (old) => mapInfiniteReadPages(old, opts),
  );
  queryClient.setQueryData<NotificationUnreadCountQueryData | undefined>(
    unreadCountKey,
    (old) => patchUnreadCount(old, opts),
  );
}

export function restoreNotificationCaches(
  queryClient: QueryClient,
  infiniteKey: QueryKey,
  unreadCountKey: QueryKey,
  snapshot: NotificationCachesSnapshot | undefined,
) {
  if (!snapshot) return;
  queryClient.setQueryData(infiniteKey, snapshot.infinite);
  queryClient.setQueryData(unreadCountKey, snapshot.unreadCount);
}
