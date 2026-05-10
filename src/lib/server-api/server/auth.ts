import "server-only";

import { serverGet } from "@/lib/server-api/server";
import type { APIResponse } from "@/lib/apis/apiResponse";
import type { UserRead } from "@/lib/apis/auth/schema";

/** Resolve the user behind the current access cookie. Returns null if unauth. */
export async function getCurrentUser(): Promise<UserRead | null> {
  const res = await serverGet<APIResponse<UserRead>>("/auth/me", {
    swallow401: true,
  });
  if (!res || !res.success) return null;
  return res.data ?? null;
}
