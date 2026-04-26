import type { TaskCreate, TaskRead, TaskUpdate } from "@/lib/apis/tasks/schema";

export type MilestoneStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "paid";

export type MilestoneApproval =
  | "pending"
  | "approved"
  | "rejected"
  | "revision_requested";

export interface MilestoneBase {
  title: string;
  description: string;
  // renamed in backend: milestone progress status
  progress_status?: MilestoneStatus | null;
  price: number;
  due_date: string; // datetime
  project_id: number;
}

export interface MilestoneCreate extends MilestoneBase {
  tasks?: TaskCreate[];
  payment?: unknown | null;
}

export interface MilestoneRead extends MilestoneBase {
  id: number;
  // renamed in backend: milestone approval status
  status: MilestoneApproval;
  is_approved?: boolean | null;
  tasks?: TaskRead[];
  payment?: unknown | null;
}

export interface MilestoneUpdate {
  id?: number;
  title?: string;
  description?: string;
  progress_status?: MilestoneStatus | null;
  price?: number;
  due_date?: string;
  project_id?: number;
  status?: MilestoneApproval;
  tasks?: TaskUpdate[] | null;
  payment?: unknown | null;
}
