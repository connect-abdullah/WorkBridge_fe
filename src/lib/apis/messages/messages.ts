import { del, get, post, put } from "@/lib/https";
import type { APIResponse } from "@/lib/apis/apiResponse";
import { API_PREFIX } from "@/lib/apis/apiResponse";
import type {
  MessageListResponse,
  MessageMarkRead,
  MessageRead,
  MessageSend,
  MessageUpdate,
} from "@/lib/apis/messages/schema";

// /api/v1/messages
const ENDPOINT = "/messages";
const messages_api_endpoint = `${API_PREFIX}${ENDPOINT}`;

export async function sendMessage(payload: MessageSend) {
  const res = await post<APIResponse<MessageRead>, MessageSend>(
    `${messages_api_endpoint}/send`,
    payload,
  );
  return res;
}

export async function listMessages(args: {
  projectId: number;
  cursor?: number | null;
  limit?: number;
}) {
  const res = await get<APIResponse<MessageListResponse>>(
    `${messages_api_endpoint}/`,
    {
      params: {
        project_id: args.projectId,
        ...(args.cursor != null ? { cursor: args.cursor } : {}),
        ...(args.limit ? { limit: args.limit } : {}),
      },
    },
  );
  return res;
}

export async function markMessagesRead(payload: MessageMarkRead) {
  const res = await post<APIResponse<number>, MessageMarkRead>(
    `${messages_api_endpoint}/mark-read`,
    payload,
  );
  return res;
}

export async function updateMessage(messageId: number, data: MessageUpdate) {
  const res = await put<APIResponse<MessageRead>, MessageUpdate>(
    `${messages_api_endpoint}/update-message`,
    data,
    { params: { message_id: messageId } },
  );
  return res;
}

export async function deleteMessage(messageId: number) {
  const res = await del<APIResponse<boolean>>(
    `${messages_api_endpoint}/delete-message`,
    { params: { message_id: messageId } },
  );
  return res;
}

/** WebSocket URL for the chat connection. */
export function getChatSocketUrl(token: string): string {
  const isDev = process.env.NEXT_PUBLIC_DEVELOPMENT === "true";
  const httpBase = isDev
    ? process.env.NEXT_PUBLIC_DEV_URL
    : process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!httpBase) {
    throw new Error("Missing API base URL for chat WebSocket.");
  }
  const trimmed = httpBase.replace(/\/$/, "");
  const wsBase = trimmed.replace(/^https/, "wss").replace(/^http/, "ws");
  return `${wsBase}${API_PREFIX}/ws/chat?token=${encodeURIComponent(token)}`;
}
