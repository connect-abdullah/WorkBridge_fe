"use client";

import { DashboardProjectCard } from "@/components/dashboard/DashboardProjectCard";
import { RecentActivityCard } from "@/components/dashboard/RecentActivityCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { useRole } from "@/lib/permissions";
import {
  isClientDashboardKeyMetrics,
  isFreelancerDashboardKeyMetrics,
} from "@/lib/apis/dashboard/schema";
import { useQuery } from "@tanstack/react-query";
import { queryApi } from "@/lib/queryApi";
import { DashboardContentSkeleton } from "@/components/skeletons";
import {
  CheckCircle2,
  Clock4,
  FolderKanban,
  ListChecks,
  ReceiptText,
  Wallet,
  Activity as ActivityIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { formatMoney, formatActivityTimestamp } from "@/components/dashboard/DashboardProjectCard";



export default function DashboardPage() {
  const role = useRole();
  const isClient = role === "client";

  const { data: res, isLoading } = useQuery(queryApi.dashboard.summary());
  const data = res?.data ?? null;
  const metrics = data?.key_metrics ?? null;

  type StatRow = {
    title: string;
    value: string;
    hint: string;
    icon: LucideIcon;
  };

  let stats: readonly StatRow[];
  if (isClientDashboardKeyMetrics(metrics)) {
    stats = [
      {
        title: "Total Spend",
        value: formatMoney(metrics.total_spent),
        hint: "Lifetime on WorkBridge",
        icon: Wallet,
      },
      {
        title: "Active Projects",
        value: String(metrics.active_projects),
        hint: "Across your projects",
        icon: FolderKanban,
      },
      {
        title: "Pending Payments",
        value: String(metrics.pending_payments),
        hint: "Awaiting your action",
        icon: ReceiptText,
      },
      {
        title: "Milestones to approve",
        value: String(metrics.milestones_to_approve),
        hint: "Your review unlocks the next phase",
        icon: ListChecks,
      },
    ];
  } else if (isFreelancerDashboardKeyMetrics(metrics)) {
    stats = [
      {
        title: "Active Projects",
        value: String(metrics.active_projects),
        hint: "Currently in progress",
        icon: FolderKanban,
      },
      {
        title: "Total Earnings",
        value: formatMoney(metrics.total_earnings),
        hint: "All-time",
        icon: Wallet,
      },
      {
        title: "Pending Approvals",
        value: String(metrics.approval_pending_milestones),
        hint: "Milestones awaiting client review",
        icon: Clock4,
      },
      {
        title: "Completed Projects",
        value: String(metrics.completed_projects),
        hint: "Delivered",
        icon: CheckCircle2,
      },
    ];
  } else {
    stats = isClient
      ? [
          {
            title: "Total Spend",
            value: "—",
            hint: "Lifetime on WorkBridge",
            icon: Wallet,
          },
          {
            title: "Active Projects",
            value: "—",
            hint: "Across your projects",
            icon: FolderKanban,
          },
          {
            title: "Pending Payments",
            value: "—",
            hint: "Awaiting your action",
            icon: ReceiptText,
          },
          {
            title: "Milestones to approve",
            value: "—",
            hint: "Your review unlocks the next phase",
            icon: ListChecks,
          },
        ]
      : [
          {
            title: "Active Projects",
            value: "—",
            hint: "Currently in progress",
            icon: FolderKanban,
          },
          {
            title: "Total Earnings",
            value: "—",
            hint: "All-time",
            icon: Wallet,
          },
          {
            title: "Pending Approvals",
            value: "—",
            hint: "Milestones awaiting client review",
            icon: Clock4,
          },
          {
            title: "Completed Projects",
            value: "—",
            hint: "Delivered",
            icon: CheckCircle2,
          },
        ];
  }

  const projects = data?.projects ?? [];

  const activities = (data?.activity_log ?? []).map((a, idx) => ({
    id: `${a.timestamp}-${idx}`,
    icon: ActivityIcon,
    title: a.activity,
    project: a.project_name,
    by: a.user_name,
    timestamp: formatActivityTimestamp(a.timestamp),
  }));

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

      {isLoading ? (
        <DashboardContentSkeleton />
      ) : (
        <>
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
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
                  {`${projects.length} project${projects.length === 1 ? "" : "s"}`}
                </p>
              </div>
              <div className="flex flex-col space-y-3">
                {projects.map((project, index) => (
                  <DashboardProjectCard
                    key={`${project.title}-${index}`}
                    title={project.title}
                    description={project.description}
                    totalAmount={project.total_amount}
                    progressPercentage={project.progress_percentage}
                    dueDate={project.due_date ?? undefined}
                    href={`/projects/${index + 1}`}
                  />
                ))}
              </div>
            </div>

            <RecentActivityCard items={activities} />
          </section>
        </>
      )}
    </div>
  );
}
