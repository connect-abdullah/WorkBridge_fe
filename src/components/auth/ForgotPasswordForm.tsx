"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ClipboardEvent,
  FormEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  getEmailValidationError,
  getPasswordValidationError,
} from "@/lib/utils";
import { FormField, inputCls } from "@/components/ui/form-field";
import { cn } from "@/lib/utils";
import {
  forgotPassword,
  resetPasswordAfterOtp,
  verifyPasswordResetOtp,
} from "@/lib/apis/auth/auth";

const OTP_LENGTH = 6;

const emptyOtpCells = () => Array.from({ length: OTP_LENGTH }, () => "");

const otpBlockCls =
  "h-12 w-10 shrink-0 rounded-md border border-input bg-input-background text-center text-base font-semibold tabular-nums text-foreground outline-none transition sm:w-11 focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring/35 focus-visible:ring-offset-0 focus-visible:ring-offset-transparent";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [otpCells, setOtpCells] = useState<string[]>(emptyOtpCells);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    otp?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const handleRequestCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    setErrors({});

    const nextErrors: typeof errors = {};
    const emailError = getEmailValidationError(email);
    if (emailError) nextErrors.email = emailError;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    const response = await forgotPassword({ email: email.trim() });
    setIsSubmitting(false);

    if (response.success) {
      toast.success(response.message || "Check your email for a code.");
      setStep(2);
    } else {
      toast.error(response.message || "Could not send reset code.");
    }
  };

  const handleVerifyAndReset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    setErrors({});

    const nextErrors: typeof errors = {};
    const digits = otpCells.join("");
    if (digits.length !== OTP_LENGTH) nextErrors.otp = "Enter the 6-digit code.";
    const pwErr = getPasswordValidationError(newPassword);
    if (pwErr) nextErrors.newPassword = pwErr;
    if (newPassword !== confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    const trimmed = email.trim();
    const verifyRes = await verifyPasswordResetOtp({
      email: trimmed,
      otp: digits,
    });
    if (!verifyRes.success) {
      setIsSubmitting(false);
      toast.error(verifyRes.message || "Invalid or expired code.");
      return;
    }

    const resetRes = await resetPasswordAfterOtp({
      email: trimmed,
      new_password: newPassword,
    });
    setIsSubmitting(false);

    if (resetRes.success) {
      toast.success(resetRes.message || "Password updated.");
      router.push("/auth/login");
    } else {
      toast.error(resetRes.message || "Could not update password.");
    }
  };

  useEffect(() => {
    if (step !== 2) return;
    const t = window.setTimeout(() => otpInputRefs.current[0]?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [step]);

  const setOtpCell = (index: number, value: string) => {
    const raw = value.replace(/\D/g, "");
    if (raw.length > 1) {
      const chars = raw.slice(0, OTP_LENGTH).split("");
      setOtpCells((prev) => {
        const next = [...prev];
        chars.forEach((c, i) => {
          if (i < OTP_LENGTH) next[i] = c;
        });
        return next;
      });
      const focusAt = Math.min(chars.length, OTP_LENGTH - 1);
      window.requestAnimationFrame(() =>
        otpInputRefs.current[focusAt]?.focus(),
      );
      return;
    }
    const digit = raw.slice(-1);
    setOtpCells((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    if (digit && index < OTP_LENGTH - 1) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpCells[index] && index > 0) {
      e.preventDefault();
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    const chars = pasted.split("");
    setOtpCells((prev) => {
      const next = [...prev];
      chars.forEach((c, i) => {
        if (i < OTP_LENGTH) next[i] = c;
      });
      return next;
    });
    const focusAt = Math.min(chars.length, OTP_LENGTH - 1);
    otpInputRefs.current[focusAt]?.focus();
  };

  return (
    <div className="space-y-6">
      {step === 1 ? (
        <form onSubmit={handleRequestCode} className="space-y-4">
          <FormField
            label="Email"
            htmlFor="reset-email"
            error={errors.email}
          >
            <input
              id="reset-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com"
              className={inputCls}
              autoComplete="email"
            />
          </FormField>

          <Button type="submit" className="h-11 w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending code…
              </>
            ) : (
              "Send reset code"
            )}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyAndReset} className="space-y-4">
          <p className="text-sm text-muted-foreground">
            We sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>.
          </p>
          <FormField label="Code" htmlFor="reset-otp-0" error={errors.otp}>
            <div
              className="flex justify-center gap-2"
              role="group"
              aria-label="6-digit verification code"
            >
              {otpCells.map((digit, index) => (
                <input
                  key={index}
                  id={`reset-otp-${index}`}
                  ref={(el) => {
                    otpInputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                  maxLength={1}
                  value={digit}
                  onChange={(e) => setOtpCell(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  onPaste={handleOtpPaste}
                  aria-invalid={errors.otp ? true : undefined}
                  className={cn(otpBlockCls, errors.otp && "border-destructive")}
                />
              ))}
            </div>
          </FormField>
          <FormField
            label="New password"
            htmlFor="reset-new-password"
            error={errors.newPassword}
          >
            <input
              id="reset-new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputCls}
              autoComplete="new-password"
            />
          </FormField>
          <FormField
            label="Confirm password"
            htmlFor="reset-confirm-password"
            error={errors.confirmPassword}
          >
            <input
              id="reset-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputCls}
              autoComplete="new-password"
            />
          </FormField>

          <Button type="submit" className="h-11 w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating…
              </>
            ) : (
              "Verify and reset password"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-10 w-full"
            onClick={() => {
              setStep(1);
              setOtpCells(emptyOtpCells());
              setNewPassword("");
              setConfirmPassword("");
              setErrors({});
            }}
          >
            Use a different email
          </Button>
        </form>
      )}

      <p className="text-sm text-muted-foreground">
        <Link
          href="/auth/login"
          className="font-medium text-foreground hover:underline"
        >
          Back to Login
        </Link>
      </p>
    </div>
  );
}
