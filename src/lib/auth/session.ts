import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/server-api/server/auth";
import type { UserRead } from "@/lib/apis/auth/schema";

export type Role = "freelancer" | "client";

export type Session = {
  user: UserRead;
};

/**
 * Per-request memoized session lookup. Reads cookies via the server axios
 * client and resolves the current user via `/auth/me`. Returns null for
 * unauthenticated requests (401 swallowed).
 */
export const getSession = cache(async (): Promise<Session | null> => {
  const user = await getCurrentUser();
  if (!user) return null;
  return { user };
});

/** Throws a Next redirect if the request is unauthenticated. */
export async function requireSession(
  redirectTo: string = "/auth/login",
): Promise<Session> {
  const session = await getSession();
  if (!session) {
    redirect(redirectTo);
  }
  return session;
}

/** Throws a Next redirect if the request is unauthenticated or has the wrong role. */
export async function requireRole(
  role: Role,
  options?: { unauthorizedTo?: string; forbiddenTo?: string },
): Promise<Session> {
  const session = await requireSession(
    options?.unauthorizedTo ?? "/auth/login",
  );
  if (session.user.role !== role) {
    redirect(options?.forbiddenTo ?? "/dashboard");
  }
  return session;
}
