export type FileType =
  | "document"
  | "image"
  | "video"
  | "audio"
  | "link"
  | "other";

export type UploadedUserType = "freelancer" | "client";

export type FileBase = {
  file_name: string;
  file_type: FileType;
  file_path: string;
  uploaded_user: UploadedUserType;
  project_id: number;
};

// user_id is derived from RBAC/auth in the backend; never send from frontend.
export type FileCreate = FileBase;

export type FileRead = FileBase & {
  id: number;
  user_id: number;
  created_at: string;
};

export type FileUpdate = {
  file_name?: string;
  file_path?: string;
};

// Result of uploading a raw browser File (e.g. to storage)
export type UploadedFileData = {
  file_name: string;
  file_path: string; // usually a public URL
  file_type: FileType;
  mime_type: string;
  size: number;
};

