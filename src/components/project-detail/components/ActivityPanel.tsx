import { MessagesSquare } from "lucide-react";
import type { ActivityLogRead } from "@/lib/apis/activityLogs/schema";

function formatTimestamp(ts: string) {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return ts;
  return d.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ActivityPanel({
  logs,
}: {
  logs: ReadonlyArray<ActivityLogRead>;
}) {
  return (
    <section className="max-h-[560px] overflow-y-auto rounded-xl border border-border bg-card shadow-sm">
      <div className="divide-y divide-border">
        {logs.length === 0 ? (
          <div className="px-4 py-6 text-sm text-muted-foreground">
            No activity yet.
          </div>
        ) : null}
        {logs.map((item) => (
          <div key={item.id} className="flex items-start gap-3 px-4 py-3">
            <div className="mt-0.5 rounded-md bg-muted p-2 shrink-0">
              <MessagesSquare className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="break-words text-sm text-foreground">
                {item.activity}  <span className="text-muted-foreground text-xs">~ {item.user_name}</span>
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {formatTimestamp(item.timestamp)}
              </p>
              {item.user_name ? (
                <p className="mt-0.5 text-xs text-muted-foreground">
                 
                </p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
