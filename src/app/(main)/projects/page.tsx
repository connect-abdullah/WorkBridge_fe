import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { dashboardProjects } from "@/constants/dashboard";

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-foreground">Projects</h1>
        <p className="text-sm text-muted-foreground">
          View active engagements, milestones, and progress.
        </p>
      </header>

      <section className="space-y-3 flex flex-col">
        {dashboardProjects.map((project, index) => (
          <ProjectCard
            key={project.title}
            {...project}
            href={`/projects/${index + 1}`}
          />
        ))}
      </section>
    </div>
  );
}
