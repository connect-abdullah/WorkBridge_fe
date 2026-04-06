"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getEmailValidationError } from "@/lib/utils";
import { FormField, inputCls } from "@/components/ui/form-field";
import { forgotPassword } from "@/lib/apis/auth/auth";
import { formatApiFailureMessage } from "@/lib/apis/apiResponse";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string }>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    setHasSubmitted(true);
    setMessage("");

    const nextErrors: { email?: string } = {};
    const emailError = getEmailValidationError(email);
    if (emailError) nextErrors.email = emailError;

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    const response = await forgotPassword({ email });
    if (response.success) {
      toast.success("Reset email sent successfully...");
      router.push("/");
    } else {
      toast.error(
        formatApiFailureMessage(response.message, response.errors),
      );
    }
    setIsSubmitting(false);
    setErrors({});
    setHasSubmitted(false);
    setMessage("If this email exists, reset instructions were sent.");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField
        label="Email"
        htmlFor="reset-email"
        error={hasSubmitted ? errors.email : undefined}
      >
        <input
          id="reset-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@company.com"
          className={inputCls}
        />
      </FormField>

      {message ? <p className="text-sm text-success">{message}</p> : null}

      <Button type="submit" className="h-11 w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending reset link...
          </>
        ) : (
          "Reset Password"
        )}
      </Button>

      <p className="text-sm text-muted-foreground">
        <Link
          href="/auth/login"
          className="font-medium text-foreground hover:underline"
        >
          Back to Login
        </Link>
      </p>
    </form>
  );
}
