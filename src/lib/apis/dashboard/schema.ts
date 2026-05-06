/** Freelancer dashboard KPIs */
export type DashboardKeyMetrics = {
  approval_pending_milestones: number;
  active_projects: number;
  completed_projects: number;
  total_earnings: number;
};

/** Client dashboard KPIs */
export type ClientDashboardKeyMetrics = {
  total_spent: number;
  active_projects: number;
  pending_payments: number;
  milestones_to_approve: number;
};

export type DashboardKeyMetricsUnion =
  | DashboardKeyMetrics
  | ClientDashboardKeyMetrics;

export function isClientDashboardKeyMetrics(
  m: DashboardKeyMetricsUnion | null | undefined,
): m is ClientDashboardKeyMetrics {
  return m != null && "total_spent" in m;
}

export function isFreelancerDashboardKeyMetrics(
  m: DashboardKeyMetricsUnion | null | undefined,
): m is DashboardKeyMetrics {
  return m != null && "total_earnings" in m;
}

export type DashboardProject = {
  title: string;
  description: string;
  total_amount: number;
  progress_percentage: number;
  /** Date-only string (YYYY-MM-DD); optional in API */
  due_date?: string | null;
};

export type DashboardActivityLogItem = {
  activity: string;
  user_name: string;
  project_name: string;
  timestamp: string; // ISO datetime
};

export type DashboardSummary = {
  key_metrics: DashboardKeyMetricsUnion;
  projects: DashboardProject[];
  activity_log: DashboardActivityLogItem[];
};
