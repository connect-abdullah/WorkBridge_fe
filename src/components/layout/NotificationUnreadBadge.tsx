"use client";

import { cn } from "@/lib/utils";

export function NotificationUnreadBadge({
  count,
  className,
}: {
  count: number;
  /** e.g. ring color to match sidebar or bottom nav surface */
  className?: string;
}) {
  if (count <= 0) return null;
  const label = count > 99 ? "99+" : String(count);
  return (
    <span
      className={cn(
        "pointer-events-none absolute -right-1.5 -top-1.5 flex h-[13px] min-w-[12px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-destructive-foreground shadow-sm ",
        className,
      )}
      aria-hidden
    >
      {label}
    </span>
  );
}
