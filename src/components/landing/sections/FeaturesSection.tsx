import {
  Activity,
  BadgeCheck,
  Files,
  LayoutDashboard,
  Milestone,
  Wallet,
} from "lucide-react";

const features = [
  {
    title: "Role-based dashboards",
    description: "Freelancer and client views stay focused and clear.",
    Icon: LayoutDashboard,
  },
  {
    title: "Milestone tracking",
    description: "Define scope, timelines, and approval checkpoints.",
    Icon: Milestone,
  },
  {
    title: "File sharing",
    description: "Upload deliverables and keep everything versioned.",
    Icon: Files,
  },
  {
    title: "Built-in approvals",
    description: "Clients review, comment, and approve with one click.",
    Icon: BadgeCheck,
  },
  {
    title: "Payment tracking",
    description: "Match payments to milestones and status.",
    Icon: Wallet,
  },
  {
    title: "Activity timeline",
    description: "See progress, decisions, and next actions at a glance.",
    Icon: Activity,
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="px-4 pt-16 sm:pt-20">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Built for real freelancer workflows.
          </h2>
          <p className="text-sm text-muted-foreground sm:text-base">
            Everything you need to run client projects with structure — without
            adding complexity.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ title, description, Icon }) => (
            <div
              key={title}
              className="group rounded-2xl border border-border bg-card/40 p-6 transition hover:bg-card/60"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-muted/40 text-foreground transition group-hover:bg-muted/60">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="text-base font-semibold text-foreground">{title}</p>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

