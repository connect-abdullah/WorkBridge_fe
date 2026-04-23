import {
  CalendarDays,
  CheckCircle2,
  FileText,
  MessagesSquare,
} from "lucide-react";
import { type ActivityLog } from "@/constants/project-detail";

export function ActivityPanel({ logs }: { logs: ReadonlyArray<ActivityLog> }) {
  return (
    <section className="max-h-[560px] overflow-y-auto rounded-xl border border-border bg-card shadow-sm">
      <div className="divide-y divide-border">
        {logs.map((item) => (
          <div key={item.id} className="flex items-start gap-3 px-4 py-3">
            <div className="mt-0.5 rounded-md bg-muted p-2 shrink-0">
              {item.icon === "check" ? (
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              ) : null}
              {item.icon === "message" ? (
                <MessagesSquare className="h-4 w-4 text-muted-foreground" />
              ) : null}
              {item.icon === "file" ? (
                <FileText className="h-4 w-4 text-muted-foreground" />
              ) : null}
              {item.icon === "calendar" ? (
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="break-words text-sm text-foreground">
                {item.action}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {item.timestamp}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
