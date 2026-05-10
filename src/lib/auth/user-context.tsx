"use client";

import { createContext, ReactNode, useContext, useMemo } from "react";

import {
  getPermissionsFor,
  type Permissions,
  type Role,
} from "@/lib/permissions";

export type SessionUser = {
  id: number;
  name: string;
  email: string;
  role: Role;
  avatar?: string | null;
  paid_user?: boolean | null;
  paid_date?: string | null;
};

type UserContextValue = {
  user: SessionUser;
  role: Role;
  permissions: Permissions;
};

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({
  user,
  children,
}: {
  user: SessionUser;
  children: ReactNode;
}) {
  const value = useMemo<UserContextValue>(
    () => ({
      user,
      role: user.role,
      permissions: getPermissionsFor(user.role),
    }),
    [user],
  );
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useSessionUser(): SessionUser {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error("useSessionUser must be used inside <UserProvider>");
  }
  return ctx.user;
}

export function useRole(): Role {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error("useRole must be used inside <UserProvider>");
  }
  return ctx.role;
}

export function usePermissions(): Permissions {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error("usePermissions must be used inside <UserProvider>");
  }
  return ctx.permissions;
}

export function useOptionalSessionUser(): SessionUser | null {
  return useContext(UserContext)?.user ?? null;
}
