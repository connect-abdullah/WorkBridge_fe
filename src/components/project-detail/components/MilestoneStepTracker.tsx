import { type Milestone } from "@/constants/project-detail";

export function MilestoneStepTracker({
  milestoneItems,
}: {
  milestoneItems: ReadonlyArray<Milestone>;
}) {
  if (milestoneItems.length === 1) {
    const ms = milestoneItems[0];
    const steps = ["pending", "in-progress", "completed"] as const;
    const idx = steps.indexOf(ms.status);
    const activeIndex = idx === -1 ? 0 : idx;

    return (
      <section className="rounded-xl border border-border bg-card px-6 py-4 shadow-sm">
        <p className="mb-5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Project Progress
        </p>

        <div className="overflow-x-auto">
          <div className="min-w-[560px] space-y-2.5">
            {/* Row 1: dots + connectors */}
            <div className="flex items-center">
              {steps.map((step, index) => {
                const isCompleted = index < activeIndex;
                const isCurrent = index === activeIndex;

                return (
                  <div key={step} className="contents">
                    <div className="flex items-center justify-center">
                      <div
                        className={`h-4 w-4 shrink-0 rounded-full border-2 transition-colors ${
                          isCompleted
                            ? "border-primary bg-primary"
                            : isCurrent
                              ? "border-primary bg-primary/10"
                              : "border-muted-foreground/40 bg-background"
                        }`}
                      />
                    </div>
                    {index < steps.length - 1 ? (
                      <div
                        className={`h-px flex-1 transition-colors ${
                          isCompleted ? "bg-primary" : "bg-border"
                        }`}
                      />
                    ) : null}
                  </div>
                );
              })}
            </div>

            {/* Row 2: labels */}
            <div className="flex items-start">
              {steps.map((step, index) => (
                <div key={step} className="contents">
                  <div className="flex shrink-0 items-start justify-center">
                    <p className="w-24 text-center text-[11px] leading-[1.4] text-muted-foreground">
                      {step.replace("-", " ")}
                    </p>
                  </div>
                  {index < steps.length - 1 ? <div className="flex-1" /> : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  const currentIndex = milestoneItems.findIndex(
    (m) => m.status === "in-progress",
  );
  const firstIncompleteIndex = milestoneItems.findIndex(
    (m) => m.status !== "completed",
  );

  const activeIndex =
    currentIndex !== -1
      ? currentIndex
      : firstIncompleteIndex !== -1
        ? firstIncompleteIndex
        : Math.max(0, milestoneItems.length - 1);

  return (
    <section className="rounded-xl border border-border bg-card px-6 py-4 shadow-sm">
      <p className="mb-5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Project Progress
      </p>

      <div className="overflow-x-auto">
        <div className="min-w-[560px] space-y-2.5">
          {/* Row 1: dots + connectors */}
          <div className="flex items-center">
            {milestoneItems.map((milestone, index) => {
              const isCompleted = milestone.status === "completed";
              const isCurrent =
                index === activeIndex && milestone.status !== "completed";

              return (
                <div key={milestone.id} className="contents">
                  <div className="flex items-center justify-center">
                    <div
                      className={`h-4 w-4 shrink-0 rounded-full border-2 transition-colors ${
                        isCompleted
                          ? "border-primary bg-primary"
                          : isCurrent
                            ? "border-primary bg-primary/10"
                            : "border-muted-foreground/40 bg-background"
                      }`}
                    />
                  </div>
                  {index < milestoneItems.length - 1 ? (
                    <div
                      className={`h-px flex-1 transition-colors ${
                        isCompleted ? "bg-primary" : "bg-border"
                      }`}
                    />
                  ) : null}
                </div>
              );
            })}
          </div>

          {/* Row 2: labels — mirrors dot/spacer widths exactly */}
          <div className="flex items-start">
            {milestoneItems.map((milestone, index) => (
              <div key={milestone.id} className="contents">
                <div className="flex shrink-0 items-start justify-center">
                  <p className="w-24 text-center text-[11px] leading-[1.4] text-muted-foreground">
                    {milestone.title}
                  </p>
                </div>
                {index < milestoneItems.length - 1 ? (
                  <div className="flex-1" />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
