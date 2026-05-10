import "server-only";

import { serverGet } from "@/lib/server-api/server";
import type { APIResponse } from "@/lib/apis/apiResponse";
import type { PaymentRead } from "@/lib/apis/payments/schema";

export async function fetchPaymentsByProjectId(
  projectId: number,
  options?: { forClient?: boolean },
): Promise<APIResponse<PaymentRead[]> | null> {
  if (!Number.isFinite(projectId) || projectId <= 0) return null;
  const q = options?.forClient === true ? { for_client: true } : undefined;
  return serverGet<APIResponse<PaymentRead[]>>(
    `/payments/project/${projectId}`,
    { params: q, swallow401: true },
  );
}

export async function fetchPaymentsReceived(): Promise<
  APIResponse<PaymentRead[]> | null
> {
  return serverGet<APIResponse<PaymentRead[]>>("/payments/received", {
    swallow401: true,
  });
}

export async function fetchPaymentsSentRequested(): Promise<
  APIResponse<PaymentRead[]> | null
> {
  return serverGet<APIResponse<PaymentRead[]>>("/payments/sent", {
    swallow401: true,
  });
}
