import type { ActivityLogRead } from "@/lib/apis/activityLogs/schema";
import { PaginatedTable } from "@/components/ui/paginated-table";

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
  limit,
  offset,
  isLoading,
  onOffsetChange,
}: {
  logs: ReadonlyArray<ActivityLogRead>;
  limit: number;
  offset: number;
  isLoading: boolean;
  onOffsetChange: (nextOffset: number) => void;
}) {
  const hasNextPage = logs.length === limit;

  return (
    <PaginatedTable<ActivityLogRead>
      title="Activity log"
      rows={logs}
      getRowKey={(row) => row.id}
      emptyText="No activity yet."
      limit={limit}
      offset={offset}
      hasNextPage={hasNextPage}
      isLoading={isLoading}
      onOffsetChange={onOffsetChange}
      columns={[
        {
          key: "activity",
          header: "Activity",
          cell: (row) => (
            <div className="break-words text-sm text-foreground">
              {row.activity}
            </div>
          ),
          className: "w-[65%]",
        },
        {
          key: "user",
          header: "User",
          cell: (row) => (
            <div className="text-sm text-muted-foreground">
              {row.user_name || "—"}
            </div>
          ),
          className: "whitespace-nowrap",
        },
        {
          key: "time",
          header: "Time",
          cell: (row) => (
            <div className="whitespace-nowrap text-sm text-muted-foreground">
              {formatTimestamp(row.timestamp)}
            </div>
          ),
          className: "whitespace-nowrap",
        },
      ]}
    />
  );
}
