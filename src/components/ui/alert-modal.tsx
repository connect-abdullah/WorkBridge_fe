"use client";

import type * as React from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/project-detail/components/Modal";

type ActionVariant = NonNullable<React.ComponentProps<typeof Button>["variant"]>;

type AlertModalProps = {
  actionVariant?: ActionVariant;
  actionBgClass?: string;
  actionBorderClass?: string;
  actionTextClass?: string;
  actionClassName?: string;
  actionLabel: string;
  onAction: () => void | Promise<void>;
  isPending?: boolean;
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
};

export function AlertModal({
  open,
  onClose,
  title,
  description,
  actionLabel,
  onAction,
  actionVariant,
  actionBgClass,
  actionBorderClass,
  actionTextClass,
  actionClassName,
  isPending,
}: AlertModalProps) {
  const customActionClasses = [
    actionBgClass,
    actionBorderClass,
    actionTextClass,
    actionClassName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      subtitle={description}
      maxWidth="max-w-md"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          className="h-11 sm:w-28"
          onClick={onClose}
          disabled={Boolean(isPending)}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant={actionVariant ?? "default"}
          className={`h-11 sm:w-28 ${customActionClasses}`}
          onClick={onAction}
          disabled={Boolean(isPending)}
        >
          {isPending ? "Working…" : actionLabel}
        </Button>
      </div>
    </Modal>
  );
}

