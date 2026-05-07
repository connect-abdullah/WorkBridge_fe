"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const inputCls =
  "h-11 w-full rounded-md border border-input bg-input-background px-3 text-sm text-input-foreground outline-none transition placeholder:text-neutral-500 dark:placeholder:text-neutral-600 focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring/35 focus-visible:ring-offset-0 focus-visible:ring-offset-transparent";

export const selectCls =
  "h-11 w-full rounded-md border border-input bg-input-background px-3 text-sm text-input-foreground outline-none transition focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring/35 focus-visible:ring-offset-0 focus-visible:ring-offset-transparent";

export function FormField({
  label,
  htmlFor,
  error,
  labelRight,
  children,
  wide,
  className,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  labelRight?: ReactNode;
  children: ReactNode;
  wide?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", wide ? "md:col-span-2" : "", className)}>
      <div className="flex items-center justify-between gap-3">
        <label
          htmlFor={htmlFor}
          className="text-sm font-medium text-foreground"
        >
          {label}
        </label>
        {labelRight}
      </div>
      {children}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
