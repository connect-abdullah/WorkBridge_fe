export type MessageStatus = "SENT" | "DELIVERED" | "READ";

export interface MessageSend {
  project_id: number;
  content: string;
  idempotency_key?: string;
}

export interface MessageRead {
  id: number;
  content: string;
  sender_id: number;
  receiver_id: number;
  project_id: number;
  status: MessageStatus;
  created_at?: string | null;
}

export interface MessageListResponse {
  items: MessageRead[];
  next_cursor: number | null;
}

export interface MessageMarkRead {
  project_id: number;
  up_to_message_id: number;
}

export interface MessageUpdate {
  content?: string;
}

export interface MessageWsEvent {
  type: "message";
  data: MessageRead;
}
