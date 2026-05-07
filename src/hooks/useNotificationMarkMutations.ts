"use client";

import {
  useMutation,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import { toast } from "sonner";

import {
  readNotificationCachesSnapshot,
  restoreNotificationCaches,
  writeOptimisticMarkRead,
  type NotificationCachesSnapshot,
} from "@/components/notifications/notification-cache";
import type { APIResponse } from "@/lib/apis/apiResponse";
import type { NotificationCountResponse } from "@/lib/apis/notifications/schema";
import { queryApi } from "@/lib/queryApi";

const NOTIFICATIONS_ROOT: QueryKey = ["notifications"];

type Keys = { infiniteKey: QueryKey; badgeKey: QueryKey };

function useMarkReadMutation(keys: Keys) {
  const queryClient = useQueryClient();

  return useMutation<
    APIResponse<NotificationCountResponse>,
    Error,
    number[],
    NotificationCachesSnapshot
  >({
    ...queryApi.mutations.notifications.markRead(),
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_ROOT });
      const snapshot = readNotificationCachesSnapshot(
        queryClient,
        keys.infiniteKey,
        keys.badgeKey,
      );
      writeOptimisticMarkRead(queryClient, keys.infiniteKey, keys.badgeKey, {
        ids,
      });
      return snapshot;
    },
    onSuccess: (res, _ids, snapshot) => {
      if (res.success === false) {
        restoreNotificationCaches(
          queryClient,
          keys.infiniteKey,
          keys.badgeKey,
          snapshot,
        );
        toast.error(res.message || "Could not mark as read");
      }
    },
    onError: (_err, _ids, snapshot) => {
      restoreNotificationCaches(
        queryClient,
        keys.infiniteKey,
        keys.badgeKey,
        snapshot,
      );
      toast.error("Could not mark as read");
    },
  });
}

function useMarkAllReadMutation(keys: Keys) {
  const queryClient = useQueryClient();

  return useMutation<
    APIResponse<NotificationCountResponse>,
    Error,
    void,
    NotificationCachesSnapshot
  >({
    ...queryApi.mutations.notifications.markAllRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_ROOT });
      const snapshot = readNotificationCachesSnapshot(
        queryClient,
        keys.infiniteKey,
        keys.badgeKey,
      );
      writeOptimisticMarkRead(queryClient, keys.infiniteKey, keys.badgeKey, {
        all: true,
      });
      return snapshot;
    },
    onSuccess: (res, _void, snapshot) => {
      if (res.success === false) {
        restoreNotificationCaches(
          queryClient,
          keys.infiniteKey,
          keys.badgeKey,
          snapshot,
        );
        toast.error(res.message || "Could not mark all as read");
      }
    },
    onError: (_err, _void, snapshot) => {
      restoreNotificationCaches(
        queryClient,
        keys.infiniteKey,
        keys.badgeKey,
        snapshot,
      );
      toast.error("Could not mark all as read");
    },
  });
}

/** Optimistic mark-read + mark-all, keeping the infinite list and nav badge caches in sync. */
export function useNotificationMarkMutations(keys: Keys) {
  const markReadMut = useMarkReadMutation(keys);
  const markAllMut = useMarkAllReadMutation(keys);
  return { markReadMut, markAllMut };
}
