import { cn } from "@/lib/utils";

type StatusTone = "in-progress" | "pending" | "completed" | "issue";

const toneClasses: Record<StatusTone, string> = {
  "in-progress": "bg-sky-100 text-sky-700",
  pending: "bg-amber-100 text-amber-700",
  completed: "bg-emerald-100 text-emerald-700",
  issue: "bg-red-100 text-red-700",
};

export function StatusBadge({
  status,
  className,
}: {
  status: StatusTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize",
        toneClasses[status],
        className,
      )}
    >
      {status.replace("-", " ")}
    </span>
  );
}
