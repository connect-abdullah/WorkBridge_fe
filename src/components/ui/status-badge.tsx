import { cn } from "@/lib/utils";

export type StatusTone =
  | "in-progress"
  | "pending"
  | "completed"
  | "paid"
  | "issue";

const toneClasses: Record<StatusTone, string> = {
  "in-progress":
    "bg-[var(--status-in-progress-bg)] text-[var(--status-in-progress-fg)]",
  pending: "bg-[var(--status-pending-bg)] text-[var(--status-pending-fg)]",
  completed:
    "bg-[var(--status-completed-bg)] text-[var(--status-completed-fg)]",
  paid: "bg-[var(--status-paid-bg)] text-[var(--status-paid-fg)]",
  issue: "bg-[var(--status-issue-bg)] text-[var(--status-issue-fg)]",
};

export function StatusBadge({
  status,
  className,
  label,
}: {
  status: StatusTone;
  className?: string;
  /** When set, shown instead of the default text derived from `status`. */
  label?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize",
        toneClasses[status],
        className,
      )}
    >
      {label ?? status.replace("-", " ")}
    </span>
  );
}
