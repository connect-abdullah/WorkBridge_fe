import type { APIResponse } from "@/lib/apis/apiResponse";

export function unwrapApiResponse<T>(
  res: APIResponse<T>,
  fallbackMessage = "Request failed.",
): T {
  if (!res.success) {
    throw new Error(res.message || fallbackMessage);
  }
  if (res.data === undefined || res.data === null) {
    throw new Error("Response missing data.");
  }
  return res.data;
}
