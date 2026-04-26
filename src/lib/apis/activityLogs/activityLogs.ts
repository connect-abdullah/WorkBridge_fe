import { get } from "@/lib/https";
import type { APIResponse } from "@/lib/apis/apiResponse";
import { API_PREFIX } from "@/lib/apis/apiResponse";
import type { ActivityLogRead } from "./schema";

// /api/v1/activity-logs
const ENDPOINT = "/activity-logs";
const activityLogsApiEndpoint = `${API_PREFIX}${ENDPOINT}`;

export type ActivityLogsListParams = {
  limit?: number;
  offset?: number;
};

export const listActivityLogsByProjectId = async (
  projectId: number,
  params?: ActivityLogsListParams,
) => {
  const limit = typeof params?.limit === "number" ? params.limit : 10;
  const offset = typeof params?.offset === "number" ? params.offset : 0;

  const response = await get<APIResponse<ActivityLogRead[]>>(
    `${activityLogsApiEndpoint}/${projectId}?limit=${encodeURIComponent(
      String(limit),
    )}&offset=${encodeURIComponent(String(offset))}`,
  );
  return response;
};

