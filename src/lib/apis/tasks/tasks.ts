import { del, post, put } from "@/lib/https";
import type { APIResponse } from "@/lib/apis/apiResponse";
import { API_PREFIX } from "@/lib/apis/apiResponse";
import type { TaskCreate, TaskRead, TaskUpdate } from "@/lib/apis/tasks/schema";

// /api/v1/tasks
const ENDPOINT = "/tasks";
const tasks_api_endpoint = `${API_PREFIX}${ENDPOINT}`;

export async function createTask(data: TaskCreate) {
  const res = await post<APIResponse<TaskRead>, TaskCreate>(
    `${tasks_api_endpoint}/`,
    data,
  );
  return res;
}

export async function updateTask(taskId: number, data: TaskUpdate) {
  const res = await put<APIResponse<TaskRead>, TaskUpdate>(
    `${tasks_api_endpoint}/${taskId}`,
    data,
  );
  return res;
}

export async function deleteTask(taskId: number) {
  const res = await del<APIResponse<boolean>>(`${tasks_api_endpoint}/${taskId}`);
  return res;
}

