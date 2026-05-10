import "server-only";

import { serverGet } from "@/lib/server-api/server";
import type { APIResponse } from "@/lib/apis/apiResponse";
import type { DashboardSummary } from "@/lib/apis/dashboard/schema";

export async function fetchDashboardSummary(): Promise<APIResponse<DashboardSummary> | null> {
  return serverGet<APIResponse<DashboardSummary>>("/dashboard", {
    swallow401: true,
  });
}
