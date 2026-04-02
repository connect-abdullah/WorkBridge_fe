import { ProjectDetailPage } from "@/components/project-detail/ProjectDetailPage";

export default function ProjectDetailRoute({
  params,
}: {
  params: { projectId: string };
}) {
  return <ProjectDetailPage projectId={params.projectId} />;
}

