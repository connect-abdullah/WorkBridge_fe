import { NotificationsPageSkeleton } from "@/components/skeletons";

/** Shown on client navigations until the notifications RSC + HydrationBoundary resolve. */
export default function NotificationsLoading() {
  return <NotificationsPageSkeleton />;
}
