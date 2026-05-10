import { DashboardContentSkeleton, Skeleton } from "@/components/skeletons";

/** Shown on client navigations until the dashboard RSC resolves. */
export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <Skeleton className="h-8 w-64 rounded-lg" />
        <Skeleton className="h-4 w-full max-w-lg rounded" />
      </header>
      <DashboardContentSkeleton />
    </div>
  );
}
