export type Role = "freelancer" | "client";

export type Permissions = {
  canCreateProject: boolean;
  canEditProject: boolean;
  canDeleteProject: boolean;

  canCreateMilestone: boolean;
  canEditMilestone: boolean;
  canDeleteMilestone: boolean;
  canChangeMilestoneProgress: boolean;
  canApproveMilestone: boolean;

  canCreateTask: boolean;
  canEditTask: boolean;
  canDeleteTask: boolean;

  canRequestPayment: boolean;
  canPayPayment: boolean;
  canApprovePayment: boolean;
  canFailPayment: boolean;
};

const FREELANCER_PERMISSIONS: Permissions = {
  canCreateProject: true,
  canEditProject: true,
  canDeleteProject: true,

  canCreateMilestone: true,
  canEditMilestone: true,
  canDeleteMilestone: true,
  canChangeMilestoneProgress: true,
  canApproveMilestone: false,

  canCreateTask: true,
  canEditTask: true,
  canDeleteTask: true,

  canRequestPayment: true,
  canPayPayment: false,
  canApprovePayment: true,
  canFailPayment: true,
};

const CLIENT_PERMISSIONS: Permissions = {
  canCreateProject: false,
  canEditProject: false,
  canDeleteProject: false,

  canCreateMilestone: false,
  canEditMilestone: false,
  canDeleteMilestone: false,
  canChangeMilestoneProgress: false,
  canApproveMilestone: true,

  canCreateTask: false,
  canEditTask: false,
  canDeleteTask: false,

  canRequestPayment: false,
  canPayPayment: true,
  canApprovePayment: false,
  canFailPayment: false,
};

export const ROLE_PERMISSIONS: Record<Role, Permissions> = {
  freelancer: FREELANCER_PERMISSIONS,
  client: CLIENT_PERMISSIONS,
};

export function getPermissionsFor(role: Role | null | undefined): Permissions {
  if (role === "client") return CLIENT_PERMISSIONS;
  return FREELANCER_PERMISSIONS;
}

// `useRole` and `usePermissions` were previously exported from this module
// and read user state from localStorage. They now live in
// `@/lib/auth/user-context` and are populated by the server layout. Imports
// here have been removed; update call sites to use the new module.
export { useRole, usePermissions } from "@/lib/auth/user-context";
