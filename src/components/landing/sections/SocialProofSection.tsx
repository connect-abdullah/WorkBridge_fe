const stats = [
  { label: "Approvals tracked", value: "All in one timeline" },
  { label: "Milestones", value: "Clear scope per delivery" },
  { label: "Payments", value: "Tied to approvals" },
];

const testimonials = [
  {
    quote:
      "Finally a workflow my clients actually follow. No more digging through chats.",
    name: "Emily Carter",
    title: "Product Designer, Northwind Studio",
  },
  {
    quote:
      "Milestones and approvals in one place makes client work predictable and easy to manage.",
    name: "Daniel Brooks",
    title: "Full-stack Developer, Freelance Collective",
  },
];

export function SocialProofSection() {
  return (
    <section className="px-4 pt-16 sm:pt-20">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-3xl border border-border bg-gradient-to-b from-card/40 to-card/20 p-8 sm:p-10">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">
                Built for freelancers
              </p>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Professional projects deserve a professional system.
              </h2>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {stats.map((s) => (
                  <div
                    key={s.label}
                    className="rounded-2xl border border-border bg-background/40 p-4"
                  >
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              {testimonials.map((t) => (
                <figure
                  key={t.quote}
                  className="rounded-2xl border border-border bg-background/40 p-6"
                >
                  <blockquote className="text-sm text-foreground">
                    “{t.quote}”
                  </blockquote>
                  <figcaption className="mt-4 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {t.name}
                    </span>{" "}
                    — {t.title}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
