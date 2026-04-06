"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  getEmailValidationError,
  getPasswordValidationError,
} from "@/lib/utils";
import { FormField, inputCls } from "@/components/ui/form-field";
import { login } from "@/lib/apis/auth/auth";
import { formatApiFailureMessage } from "@/lib/apis/apiResponse";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    setHasSubmitted(true);

    const nextErrors: { email?: string; password?: string } = {};
    const emailError = getEmailValidationError(email);
    const passwordError = getPasswordValidationError(password);
    if (emailError) nextErrors.email = emailError;
    if (passwordError) nextErrors.password = passwordError;

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    const response = await login({ email, password });
    if (response.success) {
      toast.success("Welcome back...");
      localStorage.setItem("access_token", response.data?.access_token || "");
      localStorage.setItem("user", JSON.stringify(response.data?.user || {}));
      router.push("/");
    } else {
      toast.error(
        formatApiFailureMessage(response.message, response.errors),
      );
    }
    setIsSubmitting(false);
    setErrors({});
    setHasSubmitted(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField
        label="Email"
        htmlFor="login-email"
        error={hasSubmitted ? errors.email : undefined}
      >
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@company.com"
          className={inputCls}
        />
      </FormField>

      <FormField
        label="Password"
        htmlFor="login-password"
        labelRight={
          <Link
            href="/auth/forgot-password"
            className="text-sm text-muted-foreground transition hover:text-foreground"
          >
            Forgot Password?
          </Link>
        }
        error={hasSubmitted ? errors.password : undefined}
      >
        <div className="relative">
          <input
            id="login-password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            className={`${inputCls} pr-11`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </FormField>

      <Button
        type="submit"
        className="h-11 w-full"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          "Login"
        )}
      </Button>

      <p className="text-sm text-muted-foreground">
        New to WorkBridge?{" "}
        <Link
          href="/auth/signup"
          className="font-medium text-foreground hover:underline"
        >
          Create account
        </Link>
      </p>
    </form>
  );
}
