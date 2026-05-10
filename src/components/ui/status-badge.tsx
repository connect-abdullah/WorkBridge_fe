import { cn } from "@/lib/utils";

export type StatusTone =
  | "in-progress"
  | "pending"
  | "completed"
  | "paid"
  | "issue"
  | "neutral";

const toneClasses: Record<StatusTone, string> = {
  "in-progress":
    "bg-[var(--status-in-progress-bg)] text-[var(--status-in-progress-fg)]",
  pending: "bg-[var(--status-pending-bg)] text-[var(--status-pending-fg)]",
  completed:
    "bg-[var(--status-completed-bg)] text-[var(--status-completed-fg)]",
  paid: "bg-[var(--status-paid-bg)] text-[var(--status-paid-fg)]",
  issue: "bg-[var(--status-issue-bg)] text-[var(--status-issue-fg)]",
  neutral: "bg-[var(--status-neutral-bg)] text-[var(--status-neutral-fg)]",
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
        "shadow-sm ring-1 ring-black/5 dark:ring-white/10",
        "transition-[filter,box-shadow] duration-150 hover:brightness-[1.03] dark:hover:brightness-110",
        toneClasses[status],
        className,
      )}
    >
      {label ?? status.replace("-", " ")}
    </span>
  );
}
