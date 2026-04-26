import type { QueryClient } from "@tanstack/react-query";
import { handleUpload } from "@/lib/supabase";
import type { APIResponse } from "@/lib/apis/apiResponse";
import { createFile, listFilesByProjectId } from "@/lib/apis/files/files";
import { queryKeys } from "@/lib/queryApi";
import type {
  UploadedUserType,
  FileType,
  FileCreate,
  FileRead,
} from "@/lib/apis/files/schema";


export function inferFileType(mimeType: string): FileType {
  const mt = (mimeType || "").toLowerCase();
  if (mt.startsWith("image/")) return "image";
  if (mt.startsWith("video/")) return "video";
  if (mt.startsWith("audio/")) return "audio";
  if (
    [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ].some(type => mt === type) ||
    ["text/", "msword", "officedocument", "spreadsheet", "presentation"].some(sub =>
      mt.startsWith(sub) || mt.includes(sub)
    )
  ) {
    return "document";
  }
  return "other";
}

export function getUploadedUserType(): UploadedUserType {
  if (typeof window === "undefined") return "client";
  try {
    const raw = localStorage.getItem("auth:user");
    if (!raw) return "client";
    const parsed = JSON.parse(raw) as { role?: unknown };
    return parsed.role === "freelancer" ? "freelancer" : "client";
  } catch {
    return "client";
  }
}

export async function uploadProjectFile(file: File, projectId: number) {
  const publicUrl = await handleUpload(file);
  const payload: FileCreate = {
    file_name: file.name,
    file_path: publicUrl,
    file_type: inferFileType(file.type),
    uploaded_user: getUploadedUserType(),
    project_id: projectId,
  };

  return createFile(payload);
}

export function appendProjectFileToCache(
  queryClient: QueryClient,
  projectId: number,
  file: FileRead,
) {
  queryClient.setQueryData<APIResponse<FileRead[]> | undefined>(
    queryKeys.files.listByProjectId(projectId),
    (prev) =>
      prev
        ? { ...prev, data: [...(prev.data ?? []), file] }
        : { success: true, message: "Files loaded.", data: [file] },
  );
}

/**
 * If the files cache for this project is empty (not yet fetched), fetches
 * from the API and writes it into the React Query cache.
 * Returns the resulting file list (from cache or freshly fetched).
 */
export async function fetchAndCacheProjectFiles(
  queryClient: QueryClient,
  projectId: number,
): Promise<FileRead[]> {
  const key = queryKeys.files.listByProjectId(projectId);
  const cached = queryClient.getQueryData<APIResponse<FileRead[]>>(key);

  if (cached?.success !== false && (cached?.data?.length ?? 0) > 0) {
    return cached?.data ?? [];
  }

  const res = await listFilesByProjectId(projectId);
  if (res.success !== false) {
    queryClient.setQueryData<APIResponse<FileRead[]>>(key, res);
  }
  return res.data ?? [];
}