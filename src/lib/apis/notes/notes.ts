import { del, get, post, put } from "@/lib/https";
import type { APIResponse } from "@/lib/apis/apiResponse";
import { API_PREFIX } from "@/lib/apis/apiResponse";
import type {
    NoteCreate,
    NoteRead,
    NoteUpdate,
    NoteListResponse,
} from "@/lib/apis/notes/schema";

// /api/v1/notes
const ENDPOINT = "/notes";
const notes_api_endpoint = `${API_PREFIX}${ENDPOINT}`;

export const createNote = async (note: NoteCreate) => {
    const response = await post<APIResponse<NoteRead>, NoteCreate>(
        `${notes_api_endpoint}/`,
        note,
    );
    return response;
};

export const getNotes = async (projectId: number) => {
    const response = await get<APIResponse<NoteListResponse>>(
        `${notes_api_endpoint}/${projectId}`,
    );
    return response;
};

export const getNotesByMeetingId = async (meetingId: number) => {
    const response = await get<APIResponse<NoteListResponse>>(
        `${notes_api_endpoint}/${meetingId}`,
    );
    return response;
};

export const updateNote = async (noteId: number, note: NoteUpdate) => {
    const response = await put<APIResponse<NoteRead>, NoteUpdate>(
        `${notes_api_endpoint}/${noteId}`,
        note,
    );
    return response;
};

export const deleteNote = async (noteId: number) => {
    const response = await del<APIResponse<boolean>>(
        `${notes_api_endpoint}/${noteId}`,
    );  
    return response;
};