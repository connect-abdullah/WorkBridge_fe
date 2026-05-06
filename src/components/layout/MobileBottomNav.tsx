"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { cn } from "@/lib/utils";
import { forceLogout } from "@/lib/forceLogout";
import { NAV_ITEMS, isNavItemActive } from "./navItems";

export function MobileBottomNav({ className }: { className?: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    forceLogout(false);
    router.push("/auth/login");
  };

  return (
    <nav
      aria-label="Primary"
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 shadow-[0_-4px_24px_-8px_rgba(0,0,0,0.12)] backdrop-blur-md dark:shadow-[0_-4px_24px_-8px_rgba(0,0,0,0.4)]",
        "pb-[env(safe-area-inset-bottom)] pt-0",
        className,
      )}
    >
      <ul className="grid grid-cols-6 divide-x divide-border">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = isNavItemActive(pathname, href);
          return (
            <li key={href} className="min-w-0">
              <Link
                href={href}
                aria-label={label}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex min-h-[3.25rem] items-center justify-center px-1 py-3 transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  active
                    ? "bg-primary/12 text-primary after:absolute after:inset-x-2 after:top-0 after:h-0.5 after:rounded-full after:bg-primary"
                    : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
                )}
              >
                <Icon
                  className={cn(
                    "h-6 w-6 shrink-0 transition-transform",
                    active && "scale-110",
                  )}
                  aria-hidden
                />
              </Link>
            </li>
          );
        })}
        <li className="min-w-0">
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Log out"
            className="flex min-h-[3.25rem] w-full items-center justify-center px-1 py-3 text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <LogOut className="h-6 w-6 shrink-0" aria-hidden />
          </button>
        </li>
      </ul>
    </nav>
  );
}
