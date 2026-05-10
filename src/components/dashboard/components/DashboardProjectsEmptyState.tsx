import Link from "next/link";
import { Button } from "@/components/ui/button";
import { dashboardWorkflowSteps } from "@/components/dashboard/dashboardEmptyGuidance";

export function DashboardProjectsEmptyState({
  isClient,
}: {
  isClient: boolean;
}) {
  const steps = isClient
    ? dashboardWorkflowSteps.client
    : dashboardWorkflowSteps.freelancer;

  return (
    <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h3 className="text-base font-semibold text-foreground">No Projects Yet</h3>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {isClient
          ? "A freelancer will invite you first. Use their link to join the project workspace."
          : "Create a project and add your client to get started."}
      </p>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        {isClient
          ? "After you join, you can review work, give feedback, and track milestone progress here."
          : "Break work into milestones and manage delivery in one place."}
      </p>
      <p className="mt-4 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        Typical flow
      </p>
      <ol className="mt-1.5 list-decimal space-y-1 pl-4 text-xs leading-relaxed text-muted-foreground">
        {steps.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>
      {!isClient ? (
        <div className="mt-5">
          <Button asChild className="h-10">
            <Link href="/projects">Create Project</Link>
          </Button>
        </div>
      ) : null}
    </article>
  );
}
