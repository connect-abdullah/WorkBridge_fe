"use client";

import { ReactNode, useState } from "react";
import { Menu } from "lucide-react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Button } from "@/components/ui/button";

export function DashboardShell({ children }: { children: ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur lg:hidden">
        <p className="text-sm font-semibold">WorkBridge</p>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Open menu"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </header>

      <AppSidebar className="hidden lg:flex" />

      {mobileMenuOpen ? (
        <>
          <button
            type="button"
            aria-label="Close menu overlay"
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <AppSidebar
            className="z-50 lg:hidden"
            showCloseButton
            onClose={() => setMobileMenuOpen(false)}
            onNavigate={() => setMobileMenuOpen(false)}
          />
        </>
      ) : null}

      <main className="min-h-screen px-4 py-5 sm:px-6 sm:py-6 lg:ml-64 lg:p-8">
        {children}
      </main>
    </div>
  );
}
