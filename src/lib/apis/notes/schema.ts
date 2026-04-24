// Matches backend schema + envelope (see src/lib/API.md)
export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: any | null;
};

export type NoteType = "shared" | "private";

export type NoteCreate = {
  content: string;
  type: NoteType;
  project_id: number;
  user_id: number;
  meeting_id?: number;
};

export type NoteRead = {
  id: number;
  content: string;
  type: NoteType;
  project_id: number;
  user_id: number;
  meeting_id: number | null;
};

export type NoteUpdate = {
  content?: string;
  type?: NoteType;
};

export type NoteVisibilityBuckets = {
  private: NoteRead | null;
  shared: NoteRead | null;
};

export type NoteListResponse = {
  project: NoteVisibilityBuckets;
  meeting: NoteVisibilityBuckets;
};
