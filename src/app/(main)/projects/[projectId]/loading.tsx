import {
  MilestoneStepTrackerSkeleton,
  ProjectDetailHeaderSkeleton,
  ProjectDetailTabContentSkeleton,
  ProjectDetailTabsSkeleton,
} from "@/components/skeletons";

/** Shown on client navigations until the project detail RSC + HydrationBoundary resolve. */
export default function ProjectDetailLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-10">
      <header className="space-y-3 border-b border-border pb-5">
        <ProjectDetailHeaderSkeleton />
      </header>
      <MilestoneStepTrackerSkeleton />
      <div className="sticky top-0 z-20 border-b border-border backdrop-blur">
        <ProjectDetailTabsSkeleton />
      </div>
      <ProjectDetailTabContentSkeleton />
    </div>
  );
}
