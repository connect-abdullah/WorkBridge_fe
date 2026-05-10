import { ProjectsListSkeleton, Skeleton } from "@/components/skeletons";

/** Shown on client navigations until the projects list RSC resolves. */
export default function ProjectsLoading() {
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <Skeleton className="h-8 w-40 rounded-lg sm:h-9 sm:w-44" />
          <Skeleton className="h-4 w-full max-w-md rounded sm:h-[15px]" />
        </div>
        <Skeleton className="h-10 w-36 rounded-md" />
      </header>
      <ProjectsListSkeleton />
    </div>
  );
}
