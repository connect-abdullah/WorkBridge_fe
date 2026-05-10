import { LucideIcon } from "lucide-react";
import { getActivitySentence } from "@/constants/activity-messages";
import { DashboardRecentActivityEmpty } from "@/components/dashboard/components/DashboardRecentActivityEmpty";

type ActivityItem = {
  id: string;
  /** API activity name or already-sentenced title (preferred). */
  title?: string;
  /** Back-compat: some callers may still pass a single message string. */
  message?: string;
  project?: string;
  by?: string;
  timestamp: string;
  icon: LucideIcon;
};

export function RecentActivityCard({
  items,
  isClient,
}: {
  items: ReadonlyArray<ActivityItem>;
  isClient: boolean;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h2 className="text-lg font-semibold">Recent Activity</h2>
      <div className="mt-4 max-h-[520px] space-y-4 overflow-y-auto pr-1">
        {items.length === 0 ? (
          <DashboardRecentActivityEmpty isClient={isClient} />
        ) : (
          items.map((item) => {
            const Icon = item.icon;
            const titleRaw = item.title ?? item.message ?? "";
            const title = getActivitySentence(titleRaw);
            return (
              <div key={item.id} className="flex items-start gap-3">
                <div className="mt-0.5 rounded-md bg-muted p-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{title}</p>
                  {item.project ? (
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      <span className="font-medium text-muted-foreground">
                        Project:
                      </span>{" "}
                      {item.project}
                    </p>
                  ) : null}
                  {item.by ? (
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      <span className="font-medium text-muted-foreground">
                        By:
                      </span>{" "}
                      {item.by}
                    </p>
                  ) : null}
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {item.timestamp}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
