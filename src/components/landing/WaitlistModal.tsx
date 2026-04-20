"use client";

import { FormEvent, useEffect, useId, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FormField, inputCls } from "@/components/ui/form-field";
import { cn, getEmailValidationError, getNameValidationError } from "@/lib/utils";
import { landingCopy } from "@/components/landing/landingCopy";
import { waitlistService } from "@/lib/apis/waitlist/waitlist";

type WaitlistFormState = {
  name: string;
  email: string;
  city: string;
};

export function WaitlistModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
}) {
  const titleId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [values, setValues] = useState<WaitlistFormState>({
    name: "",
    email: "",
    city: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof WaitlistFormState, string>>>(
    {},
  );

  const isMountedOpen = open;

  const reset = () => {
    setSubmitted(false);
    setIsSubmitting(false);
    setValues({ name: "", email: "", city: "" });
    setErrors({});
  };

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKeyDown);

    const t = window.setTimeout(() => inputRef.current?.focus(), 0);

    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onOpenChange]);

  useEffect(() => {
    if (open) return;
    reset();
  }, [open]);

  const canSubmit = useMemo(() => {
    return (
      values.name.trim().length > 1 &&
      !getEmailValidationError(values.email) &&
      values.city.trim().length > 0 &&
      !isSubmitting
    );
  }, [values, isSubmitting]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const nextErrors: Partial<Record<keyof WaitlistFormState, string>> = {};
    const nameError = getNameValidationError(values.name);
    const emailError = getEmailValidationError(values.email);
    if (nameError) nextErrors.name = nameError;
    if (emailError) nextErrors.email = emailError;
    if (!values.city.trim()) nextErrors.city = "City is required.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    try {
      setIsSubmitting(true);
      await waitlistService.create({
        name: values.name.trim(),
        email: values.email.trim(),
        city: values.city.trim(),
      });
      setSubmitted(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to join waitlist.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isMountedOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-[60] flex items-center justify-center px-4 py-8"
    >
      <button
        aria-label="Close waitlist dialog"
        className="absolute inset-0 bg-[var(--overlay-color)]"
        onClick={() => onOpenChange(false)}
      />

      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-background shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div className="space-y-1">
            <h2 id={titleId} className="text-lg font-semibold text-foreground">
              {submitted ? landingCopy.waitlist.thanksTitle : landingCopy.waitlist.title}
            </h2>
            <p className="text-sm text-muted-foreground">
              {submitted
                ? landingCopy.waitlist.thanksSubtitle
                : "Be the first to know when WorkBridge launches."}
            </p>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 rounded-full"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="px-6 py-6">
          {submitted ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground">
                  You can close this window. We’ll reach out when the product is live.
                </p>
              </div>
              <Button className="w-full" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField
                label="Name"
                htmlFor="waitlist-name"
                error={errors.name}
              >
                <input
                  ref={inputRef}
                  id="waitlist-name"
                  className={cn(inputCls, errors.name ? "border-destructive" : "")}
                  value={values.name}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, name: e.target.value }))
                  }
                  placeholder="Your name"
                  autoComplete="name"
                />
              </FormField>

              <FormField
                label="Email"
                htmlFor="waitlist-email"
                error={errors.email}
              >
                <input
                  id="waitlist-email"
                  className={cn(inputCls, errors.email ? "border-destructive" : "")}
                  value={values.email}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, email: e.target.value }))
                  }
                  placeholder="you@studio.com"
                  autoComplete="email"
                />
              </FormField>

              <FormField label="City" htmlFor="waitlist-city" error={errors.city}>
                <input
                  id="waitlist-city"
                  className={cn(inputCls, errors.city ? "border-destructive" : "")}
                  value={values.city}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, city: e.target.value }))
                  }
                  placeholder="Your city"
                  autoComplete="address-level2"
                />
              </FormField>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  type="submit"
                  className="h-11 flex-1"
                  disabled={!canSubmit}
                >
                  {isSubmitting ? "Joining..." : landingCopy.waitlist.submit}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 flex-1"
                  onClick={() => onOpenChange(false)}
                >
                  Not now
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                No spam. Just a single email when we launch.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

