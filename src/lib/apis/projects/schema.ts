import type {
  MilestoneCreate,
  MilestoneRead,
  MilestoneUpdate,
} from "@/lib/apis/milestones/schema";
import type { TaskCreate } from "@/lib/apis/tasks/schema";

export type ProjectStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "paid";

export interface ProjectBase {
  title: string;
  description: string;
  status: ProjectStatus;
  freelancer_id: number;
  client_id: number;
  total_amount: number;
  amount_paid: number;
  start_date: string; // datetime
  end_date: string; // datetime
}

export interface ProjectCreate extends Omit<ProjectBase, "status"> {
  status?: ProjectStatus;
  // When creating a project with nested milestones/tasks, the backend typically
  // assigns `project_id` / `milestone_id` automatically.
  milestones?: ProjectMilestoneCreateInput[] | null;
}

export interface ProjectRead extends ProjectBase {
  id: number;
}

// The backend returns MilestoneRead here, but we keep it as a shared shape.
export interface ProjectReadWithMilestones extends ProjectRead {
  milestones?: MilestoneRead[] | null;
}

export interface ProjectUpdate {
  title?: string;
  description?: string;
  status?: ProjectStatus;
  freelancer_id?: number;
  client_id?: number;
  total_amount?: number;
  amount_paid?: number;
  start_date?: string;
  end_date?: string;
  milestones?: MilestoneUpdate[] | null;
}

export type ProjectTaskCreateInput = Omit<TaskCreate, "milestone_id"> & {
  milestone_id?: number;
};

export type ProjectMilestoneCreateInput = Omit<
  MilestoneCreate,
  "project_id" | "tasks"
> & {
  project_id?: number;
  tasks?: ProjectTaskCreateInput[];
};
