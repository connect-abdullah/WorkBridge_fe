"use client";

import { memo, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/** Base pulse block; use for layout-matched placeholders. */
export const Skeleton = memo(function Skeleton({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted/70", className)}
      {...props}
    />
  );
});
