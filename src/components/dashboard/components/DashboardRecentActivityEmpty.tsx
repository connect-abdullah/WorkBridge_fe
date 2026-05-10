import { dashboardWorkflowSteps } from "@/components/dashboard/dashboardEmptyGuidance";

export function DashboardRecentActivityEmpty({ isClient }: { isClient: boolean }) {
  const steps = isClient
    ? dashboardWorkflowSteps.client
    : dashboardWorkflowSteps.freelancer;

  return (
    <div className="rounded-lg border border-dashed border-border/80 bg-muted/15 px-4 py-5">
      <h3 className="text-sm font-semibold text-foreground">No Activity Yet</h3>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        Project updates, file uploads, feedback, and milestone changes will appear
        here.
      </p>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        {isClient
          ? "After you join via a freelancer’s invite, updates will show here when they upload work or request reviews."
          : "Activity will appear when clients review milestones or provide feedback."}
      </p>
      <p className="mt-4 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        Typical flow
      </p>
      <ol className="mt-1.5 list-decimal space-y-1 pl-4 text-xs leading-relaxed text-muted-foreground">
        {steps.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>
    </div>
  );
}
