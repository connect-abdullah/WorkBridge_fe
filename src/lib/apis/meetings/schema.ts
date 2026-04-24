export interface MeetingBase {
  title: string;
  description: string;
  meeting_link: string;
  start_time: string; // datetime
  end_time: string; // datetime
  project_id: number;
  user_id: number;
}

export type MeetingCreate = MeetingBase;

export interface MeetingRead extends MeetingBase {
  id: number;
}

export interface MeetingUpdate {
  title?: string;
  description?: string;
  meeting_link?: string;
  start_time?: string;
  end_time?: string;
}

