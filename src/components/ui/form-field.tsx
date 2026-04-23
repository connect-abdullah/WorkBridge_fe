"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const inputCls =
  "h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

export const selectCls =
  "h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

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
