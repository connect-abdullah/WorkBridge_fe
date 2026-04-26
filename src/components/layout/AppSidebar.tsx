"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Bell,
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

type Role = "freelancer" | "client";
type StoredUser = {
  id: number;
  name: string;
  email: string;
  role: Role;
  avatar?: string | null;
};

function readStoredUser(): StoredUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("auth:user");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as StoredUser;
  } catch {
    return null;
  }
}

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
  // Allow absolute URLs and same-origin paths.
  if (v.startsWith("http://") || v.startsWith("https://") || v.startsWith("/"))
    return v;
  return null;
}

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
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

  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<StoredUser | null>(() => readStoredUser());

  useEffect(() => {
    setMounted(true);
    const sync = () => setUser(readStoredUser());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("auth:user-updated", sync as EventListener);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("auth:user-updated", sync as EventListener);
    };
  }, []);

  const roleLabel = useMemo(() => {
    const role = user?.role;
    if (role === "freelancer") return "Freelancer";
    if (role === "client") return "Client";
    return "";
  }, [user?.role]);

  const avatarSrc = useMemo(
    () => normalizeAvatarSrc(user?.avatar),
    [user?.avatar],
  );

  const uiRoleLabel = mounted ? roleLabel || "Account" : "Account";
  const uiName = mounted ? user?.name || "—" : "—";

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
      <div className="border-b border-border px-3 py-5">
        <div className="flex items-center justify-between gap-3">
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
              <p className="text-xs text-muted-foreground">
                {uiRoleLabel}
              </p>
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
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

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
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/15 text-sm font-semibold text-primary">
            {mounted && avatarSrc ? (
              <Image
                src={avatarSrc}
                alt="Profile avatar"
                fill
                sizes="40px"
                className="object-cover"
              />
            ) : (
              getInitials(mounted ? user?.name : null)
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {uiName}
            </p>
            {mounted && roleLabel ? (
              <p className="text-xs text-muted-foreground">{roleLabel}</p>
            ) : null}
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
            <LogOut className="h-4 w-4" onClick={handleLogout} />
          </Button>

          <AnimatedThemeToggler className="flex-1 justify-center" />
        </div>
      </div>
    </aside>
  );
}
