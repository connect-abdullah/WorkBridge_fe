export interface TaskBase {
  title: string;
  description: string;
  milestone_id: number;
}

export type TaskCreate = TaskBase;

export interface TaskRead extends TaskBase {
  id: number;
}

export interface TaskUpdate {
  id?: number;
  title?: string;
  description?: string;
}
