export interface NoteBase {
  content: string;
  type: "private" | "shared";
  project_id: number;
  user_id: number;
  meeting_id?: number;
}

export interface NoteCreate extends NoteBase {}

export interface NoteRead extends NoteBase {
  id: number;
}

export interface NoteUpdate {
    content?: string;
    type?: "private" | "shared";
}

export interface NoteListResponse {
    private?: NoteRead;
    shared?: NoteRead;
}