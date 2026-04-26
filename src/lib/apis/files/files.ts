import { get, post, put, del } from "@/lib/https";
import type { APIResponse } from "@/lib/apis/apiResponse";
import { API_PREFIX } from "@/lib/apis/apiResponse";
import type { FileCreate, FileRead, FileUpdate } from "@/lib/apis/files/schema";

// /api/v1/files
const ENDPOINT = "/files";
const filesApiEndpoint = `${API_PREFIX}${ENDPOINT}`;

export const createFile = async (file: FileCreate) => {
  const response = await post<APIResponse<FileRead>, FileCreate>(
    `${filesApiEndpoint}`,
    file,
  );
  return response;
};

export const listFilesByProjectId = async (projectId: number) => {
  const response = await get<APIResponse<FileRead[]>>(
    `${filesApiEndpoint}/project/${projectId}`,
  );
  return response;
};

export const updateFile = async (fileId: number, file: FileUpdate) => {
  const response = await put<APIResponse<FileRead>, FileUpdate>(
    `${filesApiEndpoint}/${fileId}`,
    file,
  );
  return response;
};

export const deleteFile = async (fileId: number) => {
  const response = await del<APIResponse<boolean>>(
    `${filesApiEndpoint}/delete/${fileId}`,
  );
  return response;
};

