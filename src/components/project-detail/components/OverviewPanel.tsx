import { type Milestone } from "@/constants/project-detail";
import { type ProjectSummary } from "@/constants/project-detail";

export function OverviewPanel({
  summary,
  nextMilestone,
  completedMilestones,
  totalMilestones,
}: {
  summary: ProjectSummary;
  nextMilestone: Milestone;
  completedMilestones: Milestone[];
  totalMilestones: number;
}) {
  return (
    <section className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Next Milestone
          </p>
          <h3 className="mt-2 font-semibold text-foreground">
            {nextMilestone.title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Due {nextMilestone.dueDate}
          </p>
        </article>

        <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Budget
          </p>
          <p className="mt-2 text-xl font-semibold text-foreground">
            {summary.paidAmount}
          </p>
          <p className="text-sm text-muted-foreground">
            of {summary.totalAmount} total
          </p>
        </article>

        <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Milestones
          </p>
          <p className="mt-2 text-xl font-semibold text-foreground">
            {completedMilestones.length}
          </p>
          <p className="text-sm text-muted-foreground">
            of {totalMilestones} completed
          </p>
        </article>
      </div>

      <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h3 className="font-semibold text-foreground">Project Snapshot</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Work is progressing steadily. Current focus is milestone-level
          clarity, interaction polish, and preparing a structured handoff by end
          date.
        </p>
      </article>
    </section>
  );
}
