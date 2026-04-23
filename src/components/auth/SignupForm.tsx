"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  getConfirmPasswordValidationError,
  getEmailValidationError,
  getNameValidationError,
  getPasswordValidationError,
} from "@/lib/utils";
import { FormField, inputCls } from "@/components/ui/form-field";
import { signup } from "@/lib/apis/auth/auth";

type Role = "freelancer" | "client";

export function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<Role>("freelancer");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const nameInlineError = useMemo(() => {
    return getNameValidationError(name);
  }, [name]);

  const emailInlineError = useMemo(() => {
    return getEmailValidationError(email);
  }, [email]);

  const passwordInlineError = useMemo(() => {
    return getPasswordValidationError(password, { required: false });
  }, [password]);

  const confirmPasswordInlineError = useMemo(() => {
    return getConfirmPasswordValidationError(password, confirmPassword);
  }, [password, confirmPassword]);

  const isValid = useMemo(() => {
    return (
      !getNameValidationError(name) &&
      !getEmailValidationError(email) &&
      !getPasswordValidationError(password) &&
      !getConfirmPasswordValidationError(password, confirmPassword)
    );
  }, [name, email, password, confirmPassword]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    setHasSubmitted(true);
    setError("");

    if (!isValid) {
      if (nameInlineError) {
        setError(nameInlineError);
      } else if (emailInlineError) {
        setError(emailInlineError);
      } else if (passwordInlineError) {
        setError(passwordInlineError);
      } else if (confirmPasswordInlineError) {
        setError(confirmPasswordInlineError);
      } else {
        setError("Fill all fields correctly before continuing.");
      }
      return;
    }

    setIsSubmitting(true);
    const response = await signup({ name, email, password, role });
    if (response.success) {
      toast.success("Account created successfully...");
      const token = response.data?.access_token || "";
      localStorage.setItem("auth:token", token);
      localStorage.setItem(
        "auth:user",
        JSON.stringify(response.data?.user || {}),
      );
      document.cookie = `auth:token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
      router.push("/dashboard");
    } else {
      toast.error(response.message);
    }
    setIsSubmitting(false);
    setHasSubmitted(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField
        label="Name"
        htmlFor="signup-name"
        error={hasSubmitted ? nameInlineError : undefined}
      >
        <input
          id="signup-name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Your full name"
          className={inputCls}
        />
      </FormField>

      <FormField
        label="Email"
        htmlFor="signup-email"
        error={hasSubmitted ? emailInlineError : undefined}
      >
        <input
          id="signup-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@company.com"
          className={inputCls}
        />
      </FormField>

      <FormField
        label="Password"
        htmlFor="signup-password"
        error={hasSubmitted ? passwordInlineError : undefined}
      >
        <div className="relative">
          <input
            id="signup-password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 8 characters"
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

      <FormField
        label="Confirm password"
        htmlFor="signup-confirm-password"
        error={hasSubmitted ? confirmPasswordInlineError : undefined}
      >
        <div className="relative">
          <input
            id="signup-confirm-password"
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Re-enter your password"
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

      <div className="space-y-2">
        <span className="text-sm font-medium">Role</span>
        <div className="grid grid-cols-2 gap-2 rounded-md border border-input p-1">
          <button
            type="button"
            onClick={() => setRole("freelancer")}
            className={`h-9 rounded-sm text-sm transition ${
              role === "freelancer"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Freelancer
          </button>
          <button
            type="button"
            onClick={() => setRole("client")}
            className={`h-9 rounded-sm text-sm transition ${
              role === "client"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Client
          </button>
        </div>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button type="submit" className="h-11 w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          `Signup as ${role === "freelancer" ? "Freelancer" : "Client"}`
        )}
      </Button>

      <p className="text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/auth/login"
          className="font-medium text-foreground hover:underline"
        >
          Login
        </Link>
      </p>
    </form>
  );
}
