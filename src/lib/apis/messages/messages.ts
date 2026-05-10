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
    `${messages_api_endpoint}`,
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

/** WebSocket URL for the chat connection.
 *
 * Cookie-based auth: the browser sends the `access_token` HttpOnly cookie on
 * the WS upgrade request. We open the socket on the same origin as the page
 * so the cookie is first-party. Production deployments must reverse-proxy
 * `/api/v1/ws/chat` to FastAPI from the Next.js origin (or use the same
 * site for both); for local dev with a separate backend port, we fall back
 * to the configured backend URL with `withCredentials`-style cookie behaviour
 * — that requires `SameSite=None; Secure`, so it only works behind HTTPS.
 * 
 * One-Line Summary
 * The comment basically says:
 * "WebSocket auth works using cookies automatically, 
 * but cookies behave properly only when frontend and backend appear to come from the same site."
 */
export function getChatSocketUrl(): string {
  if (typeof window !== "undefined") {
    const wsScheme =
      window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${wsScheme}//${window.location.host}${API_PREFIX}/ws/chat`;
  }
  const isDev = process.env.NEXT_PUBLIC_DEVELOPMENT === "true";
  const httpBase = isDev
    ? process.env.NEXT_PUBLIC_DEV_URL
    : process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!httpBase) {
    throw new Error("Missing API base URL for chat WebSocket.");
  }
  const trimmed = httpBase.replace(/\/$/, "");
  const wsBase = trimmed.replace(/^https/, "wss").replace(/^http/, "ws");
  return `${wsBase}${API_PREFIX}/ws/chat`;
}
