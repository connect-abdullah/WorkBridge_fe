import { LucideIcon } from "lucide-react";

type ActivityItem = {
  id: string;
  message: string;
  timestamp: string;
  icon: LucideIcon;
};

export function RecentActivityCard({
  items,
}: {
  items: ReadonlyArray<ActivityItem>;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h2 className="text-lg font-semibold">Recent Activity</h2>
      <div className="mt-4 max-h-[520px] space-y-4 overflow-y-auto pr-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.id} className="flex items-start gap-3">
              <div className="mt-0.5 rounded-md bg-muted p-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-foreground">{item.message}</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.timestamp}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
