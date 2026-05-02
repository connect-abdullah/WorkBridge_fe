import { post } from "@/lib/https";
import type { APIResponse } from "@/lib/apis/apiResponse";
import { API_PREFIX } from "@/lib/apis/apiResponse";
import type { ProjectRead } from "@/lib/apis/projects/schema";
import type {
  ClientEmailLookupRequest,
  ProjectClientInviteAcceptRequest,
  ProjectClientInviteCreateRequest,
  ProjectClientInviteCreateResponse,
} from "@/lib/apis/projectInvites/schema";
import type { UserRead } from "@/lib/apis/auth/schema";

const BASE = `${API_PREFIX}/invite`;

export async function acceptProjectClientInvite(body: ProjectClientInviteAcceptRequest) {
  return post<APIResponse<ProjectRead>, ProjectClientInviteAcceptRequest>(
    `${BASE}/accept`,
    body,
  );
}

export async function createProjectClientInvite(
  projectId: number,
  body: ProjectClientInviteCreateRequest,
) {
  return post<
    APIResponse<ProjectClientInviteCreateResponse>,
    ProjectClientInviteCreateRequest
  >(`${BASE}/${projectId}/client-invites`, body);
}

export async function lookupClientByEmail(data: ClientEmailLookupRequest) {
  return post<APIResponse<UserRead[]>, ClientEmailLookupRequest>(
    `${BASE}/lookup`,
    data,
  );
}
