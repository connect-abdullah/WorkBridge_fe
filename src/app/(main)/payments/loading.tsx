import { PaymentsPageSkeleton } from "@/components/skeletons";

/** Shown on client navigations until the payments RSC + HydrationBoundary resolve. */
export default function PaymentsLoading() {
  return <PaymentsPageSkeleton />;
}
