import { fetchProjectsForUser } from "@/lib/server-api/server/projects";
import { requireSession } from "@/lib/auth/session";
import { ProjectPage } from "@/components/project/project-page";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  await requireSession();
  const res = await fetchProjectsForUser();
  return (
    <ProjectPage
      initialProjects={res?.data ?? []}
      initialMessage={res?.message}
    />
  );
}
