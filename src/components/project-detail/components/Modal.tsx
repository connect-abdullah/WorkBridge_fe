import { X } from "lucide-react";
import { useEffect } from "react";

import { cn } from "@/lib/utils";

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = "max-w-2xl",
  titleId,
  /** Use a higher value (e.g. z-[100]) when stacking above another dialog. */
  zIndexClass = "z-50",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: string;
  titleId?: string;
  zIndexClass?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className={cn(
        "fixed inset-0 !m-0 flex h-screen w-screen items-center justify-center bg-[var(--overlay-color)] backdrop-blur-sm !p-0",
        zIndexClass,
      )}
      style={{ margin: 0, padding: 0 }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        className={`relative m-4 flex w-full flex-col ${maxWidth} max-h-[calc(100vh-2rem)] rounded-2xl border border-border bg-card shadow-xl`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div>
            <h3
              id={titleId}
              className="text-lg font-semibold text-foreground"
            >
              {title}
            </h3>
            {subtitle ? (
              <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="min-h-0 overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
