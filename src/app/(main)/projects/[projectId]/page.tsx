import { ProjectDetailPage } from "@/components/project-detail/ProjectDetailPage";

export default async function ProjectDetailRoute({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <ProjectDetailPage projectId={projectId} />;
}

