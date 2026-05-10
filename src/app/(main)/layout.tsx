import { ReactNode } from "react";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { requireSession } from "@/lib/auth/session";

/** Cookie/session + dashboard data require a live request; avoid build-time API calls. */
export const dynamic = "force-dynamic";

export default async function MainLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user } = await requireSession("/auth/login");
  return <DashboardShell user={user}>{children}</DashboardShell>;
}
