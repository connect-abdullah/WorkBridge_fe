import { ReactNode } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/30">
      <AppSidebar />
      <main className="ml-64 min-h-screen p-6 lg:p-8">{children}</main>
    </div>
  );
}
