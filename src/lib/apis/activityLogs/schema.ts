export type ActivityLogBase = {
  activity: string;
  user_id: number;
  project_id: number;
  user_name: string;
  timestamp: string; // ISO datetime
};

export type ActivityLogRead = ActivityLogBase & {
  id: number;
};

