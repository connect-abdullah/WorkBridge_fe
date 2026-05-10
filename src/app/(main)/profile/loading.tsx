import { ProfilePageSkeleton } from "@/components/skeletons";

/** Shown on client navigations until the profile RSC + HydrationBoundary resolve. */
export default function ProfileLoading() {
  return <ProfilePageSkeleton />;
}
