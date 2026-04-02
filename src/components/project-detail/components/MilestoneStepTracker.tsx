import { type Milestone } from "@/constants/project-detail";

export function MilestoneStepTracker({
  milestoneItems,
}: {
  milestoneItems: ReadonlyArray<Milestone>;
}) {
  const currentIndex = milestoneItems.findIndex(
    (m) => m.status === "in-progress",
  );
  const activeIndex =
    currentIndex === -1 ? milestoneItems.length - 1 : currentIndex;

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
