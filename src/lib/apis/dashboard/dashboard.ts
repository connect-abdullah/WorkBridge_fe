import { get } from "@/lib/https";
import type { APIResponse } from "@/lib/apis/apiResponse";
import type { DashboardSummary } from "@/lib/apis/dashboard/schema";
import { API_PREFIX } from "@/lib/apis/apiResponse";

const ENDPOINT = "/dashboard";
const dashboardApi = `${API_PREFIX}${ENDPOINT}`;

export async function getDashboardSummary() {
  // GET /api/v1/dashboard/ (FastAPI redirects /dashboard -> /dashboard/)
  return await get<APIResponse<DashboardSummary>>(dashboardApi);
}
