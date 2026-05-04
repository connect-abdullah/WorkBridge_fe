import type { PaymentRead } from "@/lib/apis/payments/schema";

/**
 * Freelancer may preview client-submitted proof unless the payment was rejected
 * in workflow terms (e.g. failed or legacy disputed). Stays available after approval (`paid`).
 */
export function canShowFreelancerPaymentProof(p: PaymentRead): boolean {
  const url = (p.proof_of_payment || "").trim();
  if (!url) return false;
  if (p.payment_status === "disputed" || p.payment_status === "failed") {
    return false;
  }
  return true;
}

export function isLikelyImageProofUrl(url: string): boolean {
  return /\.(png|jpe?g|gif|webp|svg|bmp|avif|ico)(\?|#|$)/i.test(url.trim());
}

export function isLikelyPdfProofUrl(url: string): boolean {
  return /\.pdf(\?|#|$)/i.test(url.trim());
}
