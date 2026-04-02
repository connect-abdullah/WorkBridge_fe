"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  BriefcaseBusiness,
  CreditCard,
  LayoutGrid,
  UserRound,
  FolderKanban,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutGrid },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Payments", href: "/payments", icon: CreditCard },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Profile", href: "/profile", icon: UserRound },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 flex w-64 flex-col border-r border-border bg-card">
      <div className="border-b border-border px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary p-2 text-primary-foreground">
            <BriefcaseBusiness className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-base font-semibold">WorkBridge</h1>
            <p className="text-xs text-muted-foreground">Freelancer</p>
          </div>
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
      </div>
    </aside>
  );
}
