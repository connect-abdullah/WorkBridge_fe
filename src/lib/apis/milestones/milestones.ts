import { del, get, post, put } from "@/lib/https";
import type { APIResponse } from "@/lib/apis/apiResponse";
import { API_PREFIX } from "@/lib/apis/apiResponse";
import type {
  MilestoneCreate,
  MilestoneRead,
  MilestoneUpdate,
} from "@/lib/apis/milestones/schema";

// /api/v1/milestones
const ENDPOINT = "/milestones";
const milestones_api_endpoint = `${API_PREFIX}${ENDPOINT}`;

export async function createMilestone(data: MilestoneCreate) {
  const res = await post<APIResponse<MilestoneRead>, MilestoneCreate>(
    `${milestones_api_endpoint}/`,
    data,
  );
  return res;
}

export async function getMilestoneById(milestoneId: number) {
  const res = await get<APIResponse<MilestoneRead>>(
    `${milestones_api_endpoint}/${milestoneId}`,
  );
  return res;
}

export async function updateMilestone(
  milestoneId: number,
  data: MilestoneUpdate,
) {
  const res = await put<APIResponse<MilestoneRead>, MilestoneUpdate>(
    `${milestones_api_endpoint}/${milestoneId}`,
    data,
  );
  return res;
}

export async function deleteMilestone(milestoneId: number) {
  const res = await del<APIResponse<boolean>>(
    `${milestones_api_endpoint}/${milestoneId}`,
  );
  return res;
}
