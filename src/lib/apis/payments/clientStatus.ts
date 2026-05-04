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
