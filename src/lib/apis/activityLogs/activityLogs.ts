import { get } from "@/lib/https";
import type { APIResponse } from "@/lib/apis/apiResponse";
import { API_PREFIX } from "@/lib/apis/apiResponse";
import type { ActivityLogRead } from "./schema";

// /api/v1/activity-logs
const ENDPOINT = "/activity-logs";
const activityLogsApiEndpoint = `${API_PREFIX}${ENDPOINT}`;

export const listActivityLogsByProjectId = async (projectId: number) => {
  const response = await get<APIResponse<ActivityLogRead[]>>(
    `${activityLogsApiEndpoint}/${projectId}`,
  );
  return response;
};

