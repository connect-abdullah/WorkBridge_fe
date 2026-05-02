export type ProjectClientInviteCreateRequest = {
  notify_user_id?: number | null;
};

export type ProjectClientInviteCreateResponse = {
  id: number;
  project_id: number;
  token: string;
  invite_url: string;
  expires_at: string;
};

export type ProjectClientInviteAcceptRequest = {
  token: string;
};

export type ClientEmailLookupRequest = {
  email: string;
};
