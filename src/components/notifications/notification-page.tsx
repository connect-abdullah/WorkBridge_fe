"use client";

import { startTransition, useCallback, useMemo, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Bell, CheckCircle2, Loader2 } from "lucide-react";

import { parseInviteTokenFromActionUrl } from "@/components/notifications/invite-url";
import { ProjectClientInviteFromNotificationModal } from "@/components/notifications/ProjectClientInviteFromNotificationModal";
import { NotificationsGroupedList } from "@/components/notifications/NotificationsGroupedList";
import {
  flattenNotificationPages,
  getNotificationProjectId,
  groupNotificationsForDisplay,
} from "@/components/notifications/notification-utils";
import { navigateFromNotificationActionUrl } from "@/components/notifications/notification-navigation";
import {
  NOTIFICATIONS_PAGE_SIZE,
} from "@/lib/apis/notifications/constants";
import { NotificationsPageSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import type { NotificationRead } from "@/lib/apis/notifications/schema";
import { useAuthTokenReady } from "@/hooks/useAuthTokenReady";
import { useNotificationMarkMutations } from "@/hooks/useNotificationMarkMutations";
import { getStoredUserId, queryKeys, queryApi } from "@/lib/queryApi";

export default function NotificationsPage() {
  const router = useRouter();
  const [inviteModal, setInviteModal] = useState<{
    open: boolean;
    token: string | null;
    fallbackTitle?: string | null;
  }>({ open: false, token: null });

  const authReady = useAuthTokenReady();
  const hasToken =
    authReady === true && Boolean(localStorage.getItem("auth:token"));
  const userId = getStoredUserId() ?? 0;

  const notifInfiniteKey = queryKeys.notifications.infiniteList(
    userId,
    NOTIFICATIONS_PAGE_SIZE,
  );
  const notifUnreadCountKey = queryKeys.notifications.unreadCount(userId);

  const { markReadMut, markAllMut } = useNotificationMarkMutations({
    infiniteKey: notifInfiniteKey,
    unreadCountKey: notifUnreadCountKey,
  });

  const notificationsQuery = useInfiniteQuery({
    ...queryApi.notifications.infiniteList(userId, NOTIFICATIONS_PAGE_SIZE),
    refetchOnMount: "always",
  });

  const pages = notificationsQuery.data?.pages;
  const firstPage = pages?.[0];

  const results = useMemo(
    () => flattenNotificationPages(pages),
    [pages],
  );

  const groups = useMemo(
    () => groupNotificationsForDisplay(results),
    [results],
  );

  const unreadCount = useMemo(
    () => results.filter((n) => !n.is_read).length,
    [results],
  );

  const handleActivate = useCallback(
    (n: NotificationRead) => {
      if (!n.is_read) markReadMut.mutate([n.id]);
      const isClientInvite =
        n.notification_type.toLowerCase() === "project_client_invite";
      const inviteToken = isClientInvite
        ? parseInviteTokenFromActionUrl(n.action_url)
        : null;
      if (inviteToken) {
        const rawTitle = n.notification_data?.project_title;
        const fallbackTitle =
          typeof rawTitle === "string" && rawTitle.trim() ? rawTitle.trim() : null;
        setInviteModal({ open: true, token: inviteToken, fallbackTitle });
        return;
      }
      if (isClientInvite) {
        const url = n.action_url?.trim();
        if (url) navigateFromNotificationActionUrl(url, router);
        return;
      }
      const t = n.notification_type.toLowerCase();
      const isPaymentNotification = t.startsWith("payment_") || t.includes("payment");
      if (isPaymentNotification) {
        startTransition(() => router.push("/payments"));
        return;
      }
      const projectId = getNotificationProjectId(n);
      if (projectId != null) {
        startTransition(() => router.push(`/projects/${projectId}`));
        return;
      }
      const url = n.action_url?.trim();
      if (url) navigateFromNotificationActionUrl(url, router);
    },
    [markReadMut, router],
  );

  const closeInviteModal = useCallback(() => {
    setInviteModal({ open: false, token: null });
  }, []);

  const handleMarkAll = useCallback(() => {
    if (unreadCount === 0) return;
    markAllMut.mutate();
  }, [markAllMut, unreadCount]);

  const handleLoadMore = useCallback(() => {
    void notificationsQuery.fetchNextPage();
  }, [notificationsQuery]);

  if (authReady === null) {
    return <NotificationsPageSkeleton />;
  }

  if (!hasToken) {
    return (
      <div className="space-y-5 pb-4 md:space-y-6 md:pb-6">
        <header className="space-y-0.5">
          <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Notifications
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Sign in to see updates for your projects and payments.
          </p>
        </header>
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/25 px-5 py-12 text-center sm:px-6 sm:py-14">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground sm:h-14 sm:w-14">
            <Bell className="h-6 w-6 opacity-70 sm:h-7 sm:w-7" aria-hidden />
          </div>
          <p className="mt-4 text-sm font-medium text-foreground">
            You&apos;re signed out
          </p>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground sm:text-sm">
            Log in to view notifications from your workspace.
          </p>
        </div>
      </div>
    );
  }

  if (notificationsQuery.isPending && !firstPage) {
    return <NotificationsPageSkeleton />;
  }

  if (firstPage && firstPage.success === false) {
    return (
      <div className="space-y-5 pb-4 md:space-y-6 md:pb-6">
        <header className="space-y-0.5">
          <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Notifications
          </h1>
        </header>
        <div
          className="rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-6 text-center sm:px-5 sm:py-8"
          role="alert"
        >
          <p className="text-sm font-medium text-foreground">
            Couldn&apos;t load notifications
          </p>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            {firstPage.message || "Something went wrong. Try again in a moment."}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => notificationsQuery.refetch()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 pb-6 sm:space-y-5 md:pb-8">
      <ProjectClientInviteFromNotificationModal
        open={inviteModal.open}
        onClose={closeInviteModal}
        token={inviteModal.token}
        fallbackTitle={inviteModal.fallbackTitle}
      />
      <header className="space-y-0.5">
        <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          Notifications
        </h1>
        <p className="text-xs text-muted-foreground sm:text-sm">
          Updates across messages, payments, and project activity.
        </p>
      </header>

      <div className="flex flex-col gap-2 rounded-xl border border-border/80 bg-card px-3 py-2.5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-3.5 sm:py-2.5">
        <p className="text-xs text-muted-foreground sm:text-sm">
          <span className="font-medium text-foreground">{unreadCount}</span>{" "}
          unread
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 w-full shrink-0 touch-manipulation sm:h-8 sm:w-auto"
          disabled={unreadCount === 0 || markAllMut.isPending}
          onClick={handleMarkAll}
        >
          <CheckCircle2 className="mr-2 h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" aria-hidden />
          Mark all read
        </Button>
      </div>

      {results.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-border/80 bg-muted/20 px-5 py-10 text-center sm:px-6 sm:py-12">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-background text-muted-foreground shadow-sm ring-1 ring-border/60 sm:h-12 sm:w-12">
            <Bell className="h-6 w-6 opacity-55 sm:h-6 sm:w-6" aria-hidden />
          </div>
          <p className="mt-3 text-sm font-medium text-foreground">
            You&apos;re all caught up
          </p>
          <p className="mt-1 max-w-sm text-pretty text-xs leading-relaxed text-muted-foreground sm:text-sm">
            New alerts for payments, messages, and projects will appear here.
          </p>
        </div>
      ) : (
        <>
          <NotificationsGroupedList
            groups={groups}
            onItemActivate={handleActivate}
          />
          {notificationsQuery.hasNextPage ? (
            <div className="pt-0.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 w-full touch-manipulation sm:h-9"
                disabled={notificationsQuery.isFetchingNextPage}
                onClick={handleLoadMore}
              >
                {notificationsQuery.isFetchingNextPage ? (
                  <>
                    <Loader2
                      className="mr-2 h-3.5 w-3.5 shrink-0 animate-spin"
                      aria-hidden
                    />
                    Loading…
                  </>
                ) : (
                  "Load more"
                )}
              </Button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
