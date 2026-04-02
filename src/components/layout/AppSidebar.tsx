"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  BriefcaseBusiness,
  X,
  CreditCard,
  LayoutGrid,
  UserRound,
  FolderKanban,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { forceLogout } from "@/lib/forceLogout";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutGrid },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Payments", href: "/payments", icon: CreditCard },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Profile", href: "/profile", icon: UserRound },
];

export function AppSidebar({
  className,
  onNavigate,
  showCloseButton = false,
  onClose,
  embedded = false,
}: {
  className?: string;
  onNavigate?: () => void;
  showCloseButton?: boolean;
  onClose?: () => void;
  embedded?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    forceLogout(false);
    router.push("/auth/login");
  };

  return (
    <aside
      className={cn(
        embedded
          ? "flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground"
          : "fixed inset-y-0 left-0 flex w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
        className,
      )}
    >
      <div className="border-b border-border px-5 py-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary p-2 text-primary-foreground">
              <BriefcaseBusiness className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-base font-semibold">WorkBridge</h1>
              <p className="text-xs text-muted-foreground">Freelancer</p>
            </div>
          </div>
          {showCloseButton ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onClose}
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border px-4 py-4">
        <div className="flex items-center gap-3 rounded-lg bg-muted/60 p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
            AJ
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">Aisha Johnson</p>
            {/* <p className="text-xs text-muted-foreground">Freelancer</p> */}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-center gap-3">

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 text-muted-foreground"
            onClick={handleLogout}
            aria-label="Log out"
          >
            <LogOut className="h-4 w-4" />
          </Button>

          <AnimatedThemeToggler className="flex-1 justify-center" />
        </div>
      </div>
    </aside>
  );
}
