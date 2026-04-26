import { UploadedUserType, FileType } from "@/lib/apis/files/schema";


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