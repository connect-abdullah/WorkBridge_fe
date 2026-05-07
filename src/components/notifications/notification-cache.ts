import type { QueryClient, QueryKey } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";

import type { APIResponse } from "@/lib/apis/apiResponse";
import type { NotificationListResponse } from "@/lib/apis/notifications/schema";

export type NotificationListQueryData = APIResponse<NotificationListResponse>;
export type NotificationInfiniteQueryData =
  InfiniteData<NotificationListQueryData>;

export type NotificationCachesSnapshot = {
  infinite: NotificationInfiniteQueryData | undefined;
  badge: NotificationListQueryData | undefined;
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
  badgeKey: QueryKey,
): NotificationCachesSnapshot {
  return {
    infinite: queryClient.getQueryData<NotificationInfiniteQueryData>(
      infiniteKey,
    ),
    badge: queryClient.getQueryData<NotificationListQueryData>(badgeKey),
  };
}

export function writeOptimisticMarkRead(
  queryClient: QueryClient,
  infiniteKey: QueryKey,
  badgeKey: QueryKey,
  opts: ReadPatch,
) {
  queryClient.setQueryData<NotificationInfiniteQueryData | undefined>(
    infiniteKey,
    (old) => mapInfiniteReadPages(old, opts),
  );
  queryClient.setQueryData<NotificationListQueryData | undefined>(
    badgeKey,
    (old) => (old ? applyReadToPage(old, opts) : old),
  );
}

export function restoreNotificationCaches(
  queryClient: QueryClient,
  infiniteKey: QueryKey,
  badgeKey: QueryKey,
  snapshot: NotificationCachesSnapshot | undefined,
) {
  if (!snapshot) return;
  queryClient.setQueryData(infiniteKey, snapshot.infinite);
  queryClient.setQueryData(badgeKey, snapshot.badge);
}
