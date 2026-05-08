import Link from "next/link";

type DashboardProjectCardProps = {
  title: string;
  description?: string | null;
  totalAmount: number;
  progressPercentage: number;
  /** YYYY-MM-DD; optional when API omits it */
  dueDate?: string | null;
  href?: string;
};

export function formatMoney(amount: number) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `$${amount}`;
  }
}

export function formatLongDate(dateStr?: string) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

export function formatActivityTimestamp(isoLike: string) {
  const d = new Date(isoLike);
  if (Number.isNaN(d.getTime())) return isoLike;
  return d.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}
export function DashboardProjectCard({
  title,
  description,
  totalAmount,
  progressPercentage,
  dueDate,
  href,
}: DashboardProjectCardProps) {
  const progress = Math.max(0, Math.min(100, Number(progressPercentage) || 0));

  const card = (
    <article className="cursor-pointer flex-col rounded-xl border border-border bg-card p-4 shadow-sm transition hover:border-primary/30 hover:shadow-md">
      <header className="space-y-1">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {description ? (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {description}
          </p>
        ) : null}
      </header>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Progress
          </span>
          <span className="text-sm font-medium text-foreground">{progress}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <footer className="mt-4 flex items-end justify-between text-sm">
        <div>
          <p className="text-xs text-muted-foreground">Due date</p>
          <p className="font-medium text-foreground">
            {formatLongDate(dueDate ?? undefined)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Total amount</p>
          <p className="font-semibold text-foreground">
            {formatMoney(totalAmount)}
          </p>
        </div>
      </footer>
    </article>
  );

  if (href) return <Link href={href}>{card}</Link>;
  return card;
}

