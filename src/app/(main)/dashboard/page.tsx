"use client";

import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { RecentActivityCard } from "@/components/dashboard/RecentActivityCard";
import { StatCard } from "@/components/dashboard/StatCard";
import {
  clientDashboardActivities,
  clientDashboardProjects,
  clientDashboardStats,
  dashboardActivities,
  dashboardProjects,
  dashboardStats,
} from "@/constants/dashboard";
import { useRole } from "@/lib/permissions";

export default function DashboardPage() {
  const role = useRole();
  const isClient = role === "client";

  const stats = isClient ? clientDashboardStats : dashboardStats;
  const projects = isClient ? clientDashboardProjects : dashboardProjects;
  const activities = isClient ? clientDashboardActivities : dashboardActivities;

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-foreground">
          {isClient ? "Client Dashboard" : "Freelancer Dashboard"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isClient
            ? "Monitor your projects, milestones, and payments in one place."
            : "Track current projects, milestones, and activity at a glance."}
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              {isClient ? "Your projects" : "Projects"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isClient
                ? "Open projects with your freelancers"
                : "3 active projects"}
            </p>
          </div>
          <div className="flex flex-col space-y-3">
            {projects.map((project, index) => (
              <ProjectCard
                key={project.title}
                {...project}
                partnerKind={isClient ? "freelancer" : "client"}
                href={`/projects/${index + 1}`}
              />
            ))}
          </div>
        </div>

        <RecentActivityCard items={activities} />
      </section>
    </div>
  );
}
