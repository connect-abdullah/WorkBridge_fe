import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

import { ProjectDetailPage } from "@/components/project-detail/ProjectDetailPage";
import { fetchProjectWithMilestones } from "@/lib/server-api/server/projects";
import { requireSession } from "@/lib/auth/session";
import { queryKeys } from "@/lib/queryApi";

export const dynamic = "force-dynamic";

export default async function ProjectDetailRoute({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  await requireSession();

  const numericProjectId = Number(projectId);
  const queryClient = new QueryClient();

  if (Number.isFinite(numericProjectId) && numericProjectId > 0) {
    const initial = await fetchProjectWithMilestones(numericProjectId);
    if (initial) {
      queryClient.setQueryData(
        queryKeys.projects.detail(numericProjectId),
        initial,
      );
    }
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProjectDetailPage projectId={projectId} />
    </HydrationBoundary>
  );
}
