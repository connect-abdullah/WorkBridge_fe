import type { StatusTone } from "@/components/ui/status-badge";
import type { PaymentRead, PaymentStatus } from "@/lib/apis/payments/schema";
import { clientPaymentStatusDisplay } from "@/lib/apis/payments/clientStatus";

export function getDateValue(iso: string | null | undefined) {
  if (!iso) return 0;
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? 0 : t;
}

export function paymentStatusToBadge(status: PaymentStatus): {
  tone: StatusTone;
  label: string;
} {
  switch (status) {
    case "pending":
      return { tone: "pending", label: "Pending" };
    case "requested":
      return { tone: "in-progress", label: "Requested" };
    case "submitted":
      return { tone: "completed", label: "Awaiting Approval" };
    case "paid":
      return { tone: "paid", label: "Paid" };
    case "disputed":
      return { tone: "issue", label: "Disputed" };
    case "failed":
      return { tone: "issue", label: "Failed" };
    default:
      return { tone: "pending", label: String(status) };
  }
}

export function getPaymentBadge(
  payment: PaymentRead,
  perspective: "freelancer" | "client",
) {
  return perspective === "freelancer"
    ? paymentStatusToBadge(payment.payment_status)
    : clientPaymentStatusDisplay(payment.payment_status);
}

export function paymentStatusBadgeClassName(status: PaymentStatus): string {
  switch (status) {
    case "paid":
      return "border border-[var(--status-paid-fg)]/20 shadow-sm";
    case "pending":
      return "border border-[var(--status-pending-fg)]/20 shadow-sm";
    case "submitted":
      return "border border-[var(--status-completed-fg)]/15 shadow-sm";
    case "requested":
      return "border border-[var(--status-in-progress-fg)]/15 shadow-sm";
    case "failed":
      return "border border-destructive/35 shadow-sm";
    case "disputed":
      return "border border-amber-500/35 shadow-sm";
    default:
      return "border border-border/60 shadow-sm";
  }
}

export function formatMoney(amount: number, currency: string | null) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return String(amount);
  }
}

export function formatDate(iso: string | null | undefined) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

export function truncateTxnId(id: string, max = 14) {
  const t = id.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}
