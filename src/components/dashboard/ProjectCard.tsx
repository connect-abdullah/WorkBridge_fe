import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";

type ProjectStatus = "in-progress" | "pending" | "completed" | "issue";

export function ProjectCard({
  title,
  clientName,
  progress,
  milestoneTitle,
  milestoneDueDate,
  milestoneStatus,
  projectDueDate,
  amount,
  href,
}: {
  title: string;
  clientName: string;
  progress: number;
  milestoneTitle: string;
  milestoneDueDate: string;
  milestoneStatus: ProjectStatus;
  projectDueDate: string;
  amount: string;
  href?: string;
}) {
  const cardContent = (
    <article className="cursor-pointer flex-col rounded-xl border border-border bg-card p-4 shadow-sm transition hover:border-primary/30 hover:shadow-md">
      <div className="flex flex-col gap-4">
        {/* Top: project identity + progress */}
        <header>
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{clientName}</p>
        </header>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Progress
            </span>
            <span className="text-sm font-medium text-foreground">
              {progress}%
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Middle: next milestone */}
        <section className="rounded-lg border border-border bg-muted/30 p-3">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Next Milestone
          </p>
          <p className="line-clamp-1 text-sm font-medium text-foreground">
            {milestoneTitle}
          </p>
          <div className="mt-2 flex items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              Due {milestoneDueDate}
            </p>
            <StatusBadge status={milestoneStatus} />
          </div>
        </section>

        {/* Bottom: due date + amount */}
        <footer className="flex items-end justify-between text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Project Due Date</p>
            <p className="font-medium text-foreground">{projectDueDate}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Total Amount</p>
            <p className="font-semibold text-foreground">{amount}</p>
          </div>
        </footer>
      </div>
    </article>
  );

  if (href) {
    return <Link href={href}>{cardContent}</Link>;
  }

  return cardContent;
}
