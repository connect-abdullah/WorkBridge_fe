import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

import NotificationsPage from "@/components/notifications/notification-page";
import { fetchNotifications } from "@/lib/server-api/server/notifications";
import { NOTIFICATIONS_PAGE_SIZE } from "@/lib/apis/notifications/constants";
import { requireSession } from "@/lib/auth/session";
import { queryKeys } from "@/lib/queryApi";

export const dynamic = "force-dynamic";

export default async function NotificationsRoute() {
  const { user } = await requireSession();

  const queryClient = new QueryClient();
  const initial = await fetchNotifications({
    offset: 0,
    limit: NOTIFICATIONS_PAGE_SIZE,
  });
  if (initial) {
    queryClient.setQueryData(
      queryKeys.notifications.infiniteList(user.id, NOTIFICATIONS_PAGE_SIZE),
      { pages: [initial], pageParams: [0] },
    );
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NotificationsPage />
    </HydrationBoundary>
  );
}
