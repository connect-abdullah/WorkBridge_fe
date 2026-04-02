import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { RecentActivityCard } from "@/components/dashboard/RecentActivityCard";
import { StatCard } from "@/components/dashboard/StatCard";
import {
  dashboardActivities,
  dashboardProjects,
  dashboardStats,
} from "@/constants/dashboard";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-foreground">
          Freelancer Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Track current projects, milestones, and activity at a glance.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Projects</h2>
            <p className="text-sm text-muted-foreground">3 active engagements</p>
          </div>
          <div className="space-y-3 flex flex-col">
            {dashboardProjects.map((project, index) => (
              <ProjectCard
                key={project.title}
                {...project}
                href={`/projects/${index + 1}`}
              />
            ))}
          </div>
        </div>

        <RecentActivityCard items={dashboardActivities} />
      </section>
    </div>
  );
}

