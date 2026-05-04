import { get, post } from "@/lib/https";
import type { APIResponse } from "@/lib/apis/apiResponse";
import { API_PREFIX } from "@/lib/apis/apiResponse";
import type {
  PaymentFailBody,
  PaymentRead,
  PaymentRequestBody,
  PaymentSubmitBody,
} from "@/lib/apis/payments/schema";

const ENDPOINT = "/payments";
const base = `${API_PREFIX}${ENDPOINT}`;

export async function listPaymentsByProjectId(
  projectId: number,
  options?: { forClient?: boolean },
) {
  const q =
    options?.forClient === true ? "?for_client=true" : "";
  return get<APIResponse<PaymentRead[]>>(`${base}/project/${projectId}${q}`);
}

/** All payments for the freelancer (freelancer / `receiver_id`). */
export async function listPaymentsReceived() {
  return get<APIResponse<PaymentRead[]>>(`${base}/received`);
}

/** Client (`sender_id`) payments excluding PENDING — due, submitted, paid, etc. */
export async function listPaymentsSentRequested() {
  return get<APIResponse<PaymentRead[]>>(`${base}/sent`);
}

export async function requestPayment(paymentId: number, body: PaymentRequestBody) {
  return post<APIResponse<PaymentRead>, PaymentRequestBody>(
    `${base}/${paymentId}/request`,
    body,
  );
}

export async function submitPayment(paymentId: number, body: PaymentSubmitBody) {
  return post<APIResponse<PaymentRead>, PaymentSubmitBody>(
    `${base}/${paymentId}/submit`,
    body,
  );
}

export async function approvePayment(paymentId: number) {
  return post<APIResponse<PaymentRead>>(`${base}/${paymentId}/approve`);
}

export async function disputePayment(paymentId: number) {
  return post<APIResponse<PaymentRead>>(`${base}/${paymentId}/dispute`);
}

export async function failPayment(paymentId: number, body: PaymentFailBody) {
  return post<APIResponse<PaymentRead>, PaymentFailBody>(
    `${base}/${paymentId}/fail`,
    body,
  );
}
