import { MessageSquareWarning, Files, Wallet } from "lucide-react";

const problems = [
  {
    title: "Endless client follow-ups",
    description: "Updates get buried. Decisions get delayed.",
    Icon: MessageSquareWarning,
  },
  {
    title: "Scattered files and feedback",
    description: "Links, docs, and comments live in too many places.",
    Icon: Files,
  },
  {
    title: "Delayed or unclear payments",
    description: "Approvals and payouts don’t match the work timeline.",
    Icon: Wallet,
  },
];

export function ProblemSection() {
  return (
    <section className="px-4 pt-16 sm:pt-20">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Client work breaks down in the gaps.
          </h2>
          <p className="text-sm text-muted-foreground sm:text-base">
            WorkBridge replaces the messy back-and-forth with a system your clients
            can follow.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {problems.map(({ title, description, Icon }) => (
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

