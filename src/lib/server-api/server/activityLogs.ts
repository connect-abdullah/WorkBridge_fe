import "server-only";

import { serverGet } from "@/lib/server-api/server";
import type { APIResponse } from "@/lib/apis/apiResponse";
import type { ActivityLogRead } from "@/lib/apis/activityLogs/schema";

export async function fetchActivityLogsByProjectId(
  projectId: number,
  params?: { limit?: number; offset?: number },
): Promise<APIResponse<ActivityLogRead[]> | null> {
  if (!Number.isFinite(projectId) || projectId <= 0) return null;
  return serverGet<APIResponse<ActivityLogRead[]>>(
    `/activity-logs/${projectId}`,
    {
      params: {
        limit: params?.limit ?? 10,
        offset: params?.offset ?? 0,
      },
      swallow401: true,
    },
  );
}
