"use client";

import { useEffect, useRef, useState } from "react";
import { Image as ImageIcon, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function PaymentProofDropzone({
  file,
  onFileChange,
  disabled,
  accept = "image/*",
}: {
  file: File | null;
  onFileChange: (file: File | null) => void;
  disabled?: boolean;
  accept?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    if (file?.type.startsWith("image/")) {
      objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    } else {
      setPreviewUrl(null);
    }
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  function pickFromList(list: FileList | null) {
    const next = list?.[0];
    if (!next) return;
    const wantImage = accept.includes("image");
    if (wantImage && !next.type.startsWith("image/")) {
      toast.error("Please use an image file (PNG, JPG, WebP, …).");
      return;
    }
    onFileChange(next);
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        tabIndex={-1}
        disabled={disabled}
        onChange={(e) => {
          pickFromList(e.target.files);
          e.target.value = "";
        }}
      />

      {!file ? (
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          onDragEnter={(e) => {
            e.preventDefault();
            if (!disabled) setDragOver(true);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled) setDragOver(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
              setDragOver(false);
            }
          }}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (disabled) return;
            pickFromList(e.dataTransfer.files);
          }}
          className={cn(
            "group flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-4 py-10 text-center outline-none transition focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            dragOver
              ? "border-primary bg-primary/8 shadow-sm"
              : "border-muted-foreground/30 bg-muted/25 hover:border-primary/45 hover:bg-muted/40",
            disabled && "pointer-events-none opacity-50",
          )}
        >
          <div className="rounded-full bg-card p-3.5 shadow-sm ring-1 ring-border">
            <Upload
              className={cn(
                "h-6 w-6 transition-colors",
                dragOver ? "text-primary" : "text-muted-foreground group-hover:text-primary",
              )}
            />
          </div>
          <div className="max-w-sm">
            <p className="text-sm font-semibold text-foreground">
              Drop your screenshot here
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              Or click to browse. Use a clear image of your bank / Wise / PayPal
              confirmation.
            </p>
          </div>
        </button>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-gradient-to-b from-card to-muted/20 shadow-sm ring-1 ring-black/[0.03] dark:ring-white/[0.05]">
          <div className="flex gap-4 p-4">
            <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-lg border border-border bg-muted/50">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <ImageIcon className="h-10 w-10 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1 self-center">
              <p className="truncate text-sm font-semibold text-foreground">
                {file.name}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatBytes(file.size)}
                {file.type ? ` · ${file.type}` : null}
              </p>
              <p className="mt-2 text-xs font-medium text-primary">
                Attached as payment proof
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0 self-start text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              disabled={disabled}
              onClick={() => {
                onFileChange(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              aria-label="Remove file"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {!disabled ? (
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 border-t border-border bg-muted/30 py-2.5 text-xs font-medium text-primary transition hover:bg-muted/50"
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="h-3.5 w-3.5" />
              Replace screenshot
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
