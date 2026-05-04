import type { StatusTone } from "@/components/ui/status-badge";
import type { PaymentRead } from "@/lib/apis/payments/schema";

/** Badge label + tone for the client payments table (progress-oriented copy). */
export function clientPaymentStatusDisplay(
  status: PaymentRead["payment_status"],
): { tone: StatusTone; label: string } {
  switch (status) {
    case "pending":
      return { tone: "pending", label: "Pending" };
    case "requested":
      return { tone: "in-progress", label: "Payment due" };
    case "submitted":
      return {
        tone: "in-progress",
        label: "Waiting for freelancer approval",
      };
    case "paid":
      return { tone: "paid", label: "Paid" };
    case "disputed":
      return { tone: "issue", label: "Under review" };
    case "failed":
      return { tone: "issue", label: "Needs attention" };
    default:
      return { tone: "pending", label: String(status) };
  }
}

/** Client may upload proof when payment is due or after a send-back (failed / legacy disputed). */
export function clientCanSubmitPaymentProof(p: PaymentRead): boolean {
  return p.payment_status === "requested" || p.payment_status === "disputed";
}

/** Primary action label on the client payments table. */
export function clientPaymentSubmitButtonLabel(p: PaymentRead): string {
  if (p.payment_status === "disputed") return "Repay";
  if (p.payment_status === "requested" && p.last_failure_reason?.trim()) {
    return "Repay";
  }
  return "Pay Now";
}

/** Shown in the submit-payment modal when the client is fixing a rejected proof. */
export function clientResubmitFreelancerNote(p: PaymentRead): string | null {
  if (p.last_failure_reason?.trim()) return p.last_failure_reason.trim();
  return null;
}
