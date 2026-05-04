"use client";

import { Button } from "@/components/ui/button";
import type { ComponentProps } from "react";

type BtnVariant = NonNullable<ComponentProps<typeof Button>["variant"]>;

export function PaymentActionButton({
  label,
  onClick,
  disabled,
  variant = "default",
  className,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: BtnVariant;
  className?: string;
}) {
  return (
    <Button
      type="button"
      variant={variant}
      className={className ?? "h-8 px-4"}
      disabled={disabled}
      onClick={onClick}
    >
      {label}
    </Button>
  );
}
