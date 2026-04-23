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
    description:
      "Freelancers manage everything, while clients see only what matters; progress, deliverables, and approvals.",
    Icon: LayoutDashboard,
  },
  {
    title: "Milestone tracking",
    description:
      "Break projects into clear deliverables with defined scope, timelines, and approval checkpoints.",
    Icon: Milestone,
  },
  {
    title: "Centralized file sharing",
    description:
      "Upload and manage all deliverables in one place with version control and easy client access.",
    Icon: Files,
  },
  {
    title: "Built-in approvals",
    description:
      "Clients can review work, request revisions, or approve instantly; no back-and-forth confusion.",
    Icon: BadgeCheck,
  },
  {
    title: "Milestone-based payments",
    description:
      "Track payments tied directly to completed work so you always know what’s pending and what’s paid.",
    Icon: Wallet,
  },
  {
    title: "Activity timeline",
    description:
      "A real-time log of updates, decisions, and progress so nothing gets missed or repeated.",
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
              className="group rounded-2xl border border-border bg-card/40 p-6 transition hover:bg-card/60 shadow-md"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-muted/40 text-foreground transition group-hover:bg-muted/60">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="text-base font-semibold text-foreground">
                  {title}
                </p>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
