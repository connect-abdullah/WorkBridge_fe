import { ReactNode } from "react";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { requireSession } from "@/lib/auth/session";

export default async function MainLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user } = await requireSession("/auth/login");
  return <DashboardShell user={user}>{children}</DashboardShell>;
}
