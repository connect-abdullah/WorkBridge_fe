"use client";

import { useEffect, useMemo, useState } from "react";

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
  canDisputePayment: boolean;
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
  canDisputePayment: true,
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
  canDisputePayment: false,
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

type StoredUser = {
  id: number;
  name: string;
  email: string;
  role: Role;
  avatar?: string | null;
};

function readStoredRole(): Role | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("auth:user");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredUser | null;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed.role ?? null;
  } catch {
    return null;
  }
}

/**
 * Live role from localStorage. Re-reads on `storage` and `auth:user-updated` events.
 * Returns `null` until mounted to avoid SSR/CSR mismatch.
 */
export function useRole(): Role | null {
  const [mounted, setMounted] = useState(false);
  const [role, setRole] = useState<Role | null>(() => readStoredRole());

  useEffect(() => {
    setMounted(true);
    const sync = () => setRole(readStoredRole());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("auth:user-updated", sync as EventListener);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("auth:user-updated", sync as EventListener);
    };
  }, []);

  return mounted ? role : null;
}

/**
 * Single source of truth for role-based UI gating. Defaults to freelancer
 * permissions while the role is unknown to avoid flashing client UI on login.
 */
export function usePermissions(roleOverride?: Role | null): Permissions {
  const stored = useRole();
  const effective = roleOverride ?? stored ?? "freelancer";
  return useMemo(() => getPermissionsFor(effective), [effective]);
}
