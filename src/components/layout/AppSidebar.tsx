"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { forceLogout } from "@/lib/forceLogout";
import { useUnreadNotificationsCount } from "@/hooks/useUnreadNotificationsCount";
import { useSessionUser } from "@/lib/auth/user-context";
import { NotificationUnreadBadge } from "./NotificationUnreadBadge";
import { NAV_ITEMS, isNavItemActive } from "./navItems";

function getInitials(name?: string | null) {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  const initials = `${first}${last}`.toUpperCase();
  return initials || "U";
}

function normalizeAvatarSrc(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const v = value.trim();
  if (!v) return null;
  if (v.startsWith("http://") || v.startsWith("https://") || v.startsWith("/"))
    return v;
  return null;
}

export function AppSidebar({
  className,
  embedded = false,
}: {
  className?: string;
  embedded?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useSessionUser();

  const roleLabel = useMemo(() => {
    if (user.role === "freelancer") return "Freelancer";
    if (user.role === "client") return "Client";
    return "Account";
  }, [user.role]);

  const avatarSrc = useMemo(
    () => normalizeAvatarSrc(user.avatar),
    [user.avatar],
  );

  const { data: notificationsUnread = 0 } = useUnreadNotificationsCount();

  const handleLogout = async () => {
    await forceLogout(false);
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
      <div className="border-b border-border px-3 py-5">
        <div className="flex items-center gap-1">
          <Image
            src="/logo.png"
            alt="WorkBridge logo"
            width={100}
            height={100}
            className="h-22 w-22 object-contain"
            priority
          />
          <div>
            <h1 className="text-lg font-semibold">WorkBridge</h1>
            <p className="text-xs text-muted-foreground">{roleLabel}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = isNavItemActive(pathname, item.href);
          const isNotifications = item.href === "/notifications";

          return (
            <Link
              key={item.label}
              href={item.href}
              aria-label={
                isNotifications && notificationsUnread > 0
                  ? `${item.label}, ${notificationsUnread} unread`
                  : item.label
              }
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <span className="relative inline-flex shrink-0">
                <Icon className="h-4 w-4" />
                {isNotifications ? (
                  <NotificationUnreadBadge
                    count={notificationsUnread}
                    className="ring-sidebar"
                  />
                ) : null}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border px-4 py-4">
        <div className="flex items-center gap-3 rounded-lg bg-muted/60 p-3">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/15 text-sm font-semibold text-primary">
            {avatarSrc ? (
              <Image
                src={avatarSrc}
                alt="Profile avatar"
                fill
                sizes="40px"
                className="object-cover"
              />
            ) : (
              getInitials(user.name)
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user.name || "—"}</p>
            <p className="text-xs text-muted-foreground">{roleLabel}</p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2 text-muted-foreground"
            onClick={handleLogout}
            aria-label="Log out"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </Button>
          <AnimatedThemeToggler className="shrink-0 justify-center" />
        </div>
      </div>
    </aside>
  );
}
