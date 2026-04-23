import { CheckCircle2 } from "lucide-react";

const steps = [
  "Milestones",
  "Deliverables",
  "Client approval",
  "Payment",
] as const;

export function SolutionSection() {
  return (
    <section className="px-4 pt-16 sm:pt-20">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              A single workspace where your entire client workflow lives.
            </h2>
            <p className="text-sm text-muted-foreground sm:text-base">
              Move from scattered communication to a structured loop: plan work,
              ship deliverables, get approvals, and release payments on time.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card/40 p-6  shadow-md">
            <p className="text-sm font-medium text-foreground">
              The WorkBridge loop
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-4">
              {steps.map((label, idx) => (
                <div key={label} className="relative">
                  <div className="flex items-center gap-3 sm:flex-col sm:items-start">
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <CheckCircle2 className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Step {idx + 1}
                      </p>
                    </div>
                  </div>
                  {idx < steps.length - 1 ? (
                    <div className="mt-4 hidden h-px w-full bg-border sm:block" />
                  ) : null}
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-xl border border-border bg-muted/20 p-4">
              <p className="text-sm text-muted-foreground">
                Outcome: faster approvals + clearer expectations + payments tied
                to milestones.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
