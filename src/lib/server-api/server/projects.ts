import "server-only";

import { serverGet } from "@/lib/server-api/server";
import type { APIResponse } from "@/lib/apis/apiResponse";
import type {
  ProjectRead,
  ProjectReadWithMilestones,
} from "@/lib/apis/projects/schema";

export async function fetchProjectsForUser(): Promise<
  APIResponse<ProjectReadWithMilestones[]> | null
> {
  return serverGet<APIResponse<ProjectReadWithMilestones[]>>(
    "/projects/all",
    { swallow401: true },
  );
}

export async function fetchProjectWithMilestones(
  projectId: number,
): Promise<APIResponse<ProjectReadWithMilestones> | null> {
  if (!Number.isFinite(projectId) || projectId <= 0) return null;
  return serverGet<APIResponse<ProjectReadWithMilestones>>(
    `/projects/with-milestones/${projectId}`,
    { swallow401: true },
  );
}

export async function fetchProjectById(
  projectId: number,
): Promise<APIResponse<ProjectRead> | null> {
  if (!Number.isFinite(projectId) || projectId <= 0) return null;
  return serverGet<APIResponse<ProjectRead>>(`/projects/${projectId}`, {
    swallow401: true,
  });
}
