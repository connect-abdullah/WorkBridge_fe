"use client";

import { ReactNode } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/30">
      <AppSidebar className="hidden md:flex" />

      <main className="min-h-screen px-4 py-5 pb-[calc(4.25rem+env(safe-area-inset-bottom))] sm:px-6 sm:py-6 sm:pb-[calc(4.25rem+env(safe-area-inset-bottom))] md:ml-64 md:p-8 md:pb-8">
        {children}
      </main>

      <MobileBottomNav className="md:hidden" />
    </div>
  );
}
