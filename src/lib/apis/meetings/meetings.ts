import { del, get, post, put } from "@/lib/https";
import type { APIResponse } from "@/lib/apis/apiResponse";
import { API_PREFIX } from "@/lib/apis/apiResponse";
import type {
  MeetingCreate,
  MeetingRead,
  MeetingUpdate,
} from "@/lib/apis/meetings/schema";

// /api/v1/meetings
const ENDPOINT = "/meetings";
const meetings_api_endpoint = `${API_PREFIX}${ENDPOINT}`;

export async function createMeeting(data: MeetingCreate) {
  const res = await post<APIResponse<MeetingRead>, MeetingCreate>(
    `${meetings_api_endpoint}/`,
    data,
  );
  return res;
}

export async function listMeetingsByProject(projectId: number) {
  const res = await get<APIResponse<MeetingRead[]>>(
    `${meetings_api_endpoint}/${projectId}`,
  );
  return res;
}

export async function updateMeeting(meetingId: number, data: MeetingUpdate) {
  const res = await put<APIResponse<MeetingRead>, MeetingUpdate>(
    `${meetings_api_endpoint}/${meetingId}`,
    data,
  );
  return res;
}

export async function deleteMeeting(meetingId: number) {
  const res = await del<APIResponse<boolean>>(
    `${meetings_api_endpoint}/${meetingId}`,
  );
  return res;
}

