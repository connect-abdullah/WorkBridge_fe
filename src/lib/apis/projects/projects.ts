import { del, get, post, put } from "@/lib/https";
import type { APIResponse } from "@/lib/apis/apiResponse";
import { API_PREFIX } from "@/lib/apis/apiResponse";
import type {
  ProjectCreate,
  ProjectRead,
  ProjectReadWithMilestones,
  ProjectUpdate,
} from "@/lib/apis/projects/schema";

// /api/v1/projects
const ENDPOINT = "/projects";
const projects_api_endpoint = `${API_PREFIX}${ENDPOINT}`;

const projectsApi = {
  create: `${projects_api_endpoint}/create-project`,
  all: `${projects_api_endpoint}/all`,
  withMilestones: `${projects_api_endpoint}/with-milestones`,
  update: `${projects_api_endpoint}/update-project`,
  delete: `${projects_api_endpoint}/delete-project`,
};

export async function createProject(data: ProjectCreate) {
  const res = await post<APIResponse<ProjectRead>, ProjectCreate>(
    projectsApi.create,
    data,
  );
  return res;
}

export async function listProjectsForUser(userId: number) {
  const res = await get<APIResponse<ProjectReadWithMilestones[]>>(projectsApi.all, {
    params: { user_id: userId },
  });
  return res;
}

export async function getProjectById(projectId: number) {
  const res = await get<APIResponse<ProjectRead>>(
    `${projects_api_endpoint}/${projectId}`,
  );
  return res;
}

export async function getProjectWithMilestones(projectId: number) {
  const res = await get<APIResponse<ProjectReadWithMilestones>>(
    `${projectsApi.withMilestones}/${projectId}`,
  );
  return res;
}

export async function updateProject(projectId: number, data: ProjectUpdate) {
  const res = await put<APIResponse<ProjectRead>, ProjectUpdate>(
    projectsApi.update,
    data,
    { params: { project_id: projectId } },
  );
  return res;
}

export async function deleteProject(projectId: number) {
  const res = await del<APIResponse<boolean>>(projectsApi.delete, {
    params: { project_id: projectId },
  });
  return res;
}

