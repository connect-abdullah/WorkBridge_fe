import { ArrowRight } from "lucide-react";

const steps = [
  {
    step: "01",
    title: "Sign up as a Freelancer",
    description: "Create your account and set up your profile.",
  },
  {
    step: "02",
    title: "Create a Project",
    description: "Define the project and break it into milestones.",
  },
  {
    step: "03",
    title: "Add Your Client",
    description: "Invite or attach the client to the project workspace.",
  },
  {
    step: "04",
    title: "Collaborate in One Place",
    description:
      "Upload files, deliver work, and share updates. Your client can review, request rework, and give feedback.",
  },
  {
    step: "05",
    title: "Track Progress & Activity",
    description:
      "View activity logs, notes, and project history in real time.",
  },
  {
    step: "06",
    title: "Monitor Milestone Payments",
    description:
      "Track milestone approval status and payment readiness once milestones are approved.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="px-4 pt-16 sm:pt-20">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              How it works
            </h2>
            <p className="text-sm text-muted-foreground sm:text-base">
              A straight path from setup to delivery — milestones, collaboration,
              and tracking in one workspace.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card/40 p-6">
            <ol className="space-y-5">
              {steps.map((s, idx) => (
                <li key={s.step} className="relative">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-semibold text-primary">
                      {s.step}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-foreground">
                        {s.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {s.description}
                      </p>
                    </div>
                  </div>

                  {idx < steps.length - 1 ? (
                    <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="h-px flex-1 bg-border" />
                      <ArrowRight className="h-3.5 w-3.5" />
                      <span className="h-px flex-1 bg-border" />
                    </div>
                  ) : null}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
