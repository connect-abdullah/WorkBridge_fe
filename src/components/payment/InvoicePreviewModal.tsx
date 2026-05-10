"use client";

import { ExternalLink } from "lucide-react";

import { Modal } from "@/components/project-detail/components/Modal";
import { Button } from "@/components/ui/button";
import {
  isLikelyImageProofUrl,
  isLikelyPdfProofUrl,
} from "@/lib/apis/payments/preview";

export function InvoicePreviewModal({
  open,
  onClose,
  url,
  title,
}: {
  open: boolean;
  onClose: () => void;
  url: string | null;
  title?: string;
}) {
  const src = (url || "").trim();
  const isImage = src ? isLikelyImageProofUrl(src) : false;
  const isPdf = src ? isLikelyPdfProofUrl(src) : false;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title?.trim() || "Submitted proof"}
      subtitle="What the client attached with their payment."
      maxWidth="max-w-4xl"
      zIndexClass="z-[60]"
    >
      {!src ? (
        <p className="text-sm text-muted-foreground">No proof URL available.</p>
      ) : isImage ? (
        <div className="flex justify-center rounded-lg bg-muted/40 p-3">
          <img
            src={src}
            alt="Payment proof"
            className="max-h-[min(72vh,640px)] w-auto max-w-full rounded-md object-contain shadow-sm"
          />
        </div>
      ) : isPdf ? (
        <div className="space-y-3">
          <iframe
            title="Payment proof PDF"
            src={src}
            className="h-[min(72vh,720px)] w-full rounded-lg border border-border bg-muted/20"
          />
          <Button variant="outline" size="sm" asChild>
            <a href={src} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
              Open in new tab
            </a>
          </Button>
        </div>
      ) : (
        <div className="space-y-3 text-sm">
          <p className="text-muted-foreground">
            This proof is not an inline image or PDF. Open it in a new tab to
            review.
          </p>
          <Button variant="outline" asChild>
            <a href={src} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-1.5 h-4 w-4" />
              Open proof
            </a>
          </Button>
        </div>
      )}
    </Modal>
  );
}
