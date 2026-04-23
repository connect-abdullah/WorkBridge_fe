"use client";

import { ChangeEvent, FormEvent, useMemo, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FormField, inputCls } from "@/components/ui/form-field";
import {
  getEmailValidationError,
  getNameValidationError,
  getPasswordValidationError,
} from "@/lib/utils";
import { profileUser } from "@/constants/profile";

type ProfileFormValues = {
  name: string;
  email: string;
  password: string;
};

export default function ProfilePage() {
  const initialValues = useRef<ProfileFormValues>({
    name: profileUser.name,
    email: profileUser.email,
    password: "",
  });

  const [form, setForm] = useState<ProfileFormValues>(initialValues.current);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof ProfileFormValues, string>>
  >({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDirty = useMemo(() => {
    return (
      form.name !== initialValues.current.name ||
      form.email !== initialValues.current.email ||
      form.password.length > 0 ||
      avatarPreview !== null
    );
  }, [form, avatarPreview]);

  const validate = () => {
    const nextErrors: Partial<Record<keyof ProfileFormValues, string>> = {};
    const nameError = getNameValidationError(form.name);
    const emailError = getEmailValidationError(form.email);
    const passwordError = getPasswordValidationError(form.password, {
      required: false,
    });

    if (nameError) nextErrors.name = nameError;
    if (emailError) nextErrors.email = emailError;
    if (passwordError) nextErrors.password = passwordError;

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setHasSubmitted(true);

    if (!validate()) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSubmitting(false);

    initialValues.current = { ...form, password: "" };
    setForm((prev) => ({ ...prev, password: "" }));
    setAvatarPreview(null);
    setHasSubmitted(false);
    setErrors({});
    if (fileInputRef.current) fileInputRef.current.value = "";

    toast.success("Profile updated.");
  };

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-foreground">Profile</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account details and avatar.
        </p>
      </header>

      <div className="mx-auto w-full max-w-3xl space-y-5">
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onAvatarChange}
            className="hidden"
          />

          <div className="flex flex-col items-center text-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="group relative h-20 w-20 overflow-hidden rounded-full bg-muted text-xl font-semibold text-foreground ring-offset-background transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="Change avatar"
              title="Change avatar"
            >
              {avatarPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarPreview}
                  alt="Avatar preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                profileUser.initials
              )}
            </button>
            <p className="mt-2 text-xs text-muted-foreground">
              Click avatar to change
            </p>
            <p className="mt-3 text-lg font-semibold text-foreground">
              {profileUser.name}
            </p>
            <span className="mt-1 inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
              {profileUser.role === "freelancer" ? "Freelancer" : "Client"}
            </span>
          </div>
        </section>

        <form
          onSubmit={onSubmit}
          className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6"
        >
          <div className="space-y-4">
            <FormField
              label="Name"
              htmlFor="profile-name"
              error={hasSubmitted ? errors.name : undefined}
            >
              <input
                id="profile-name"
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                className={inputCls}
                placeholder="Your full name"
              />
            </FormField>

            <FormField
              label="Email"
              htmlFor="profile-email"
              error={hasSubmitted ? errors.email : undefined}
            >
              <input
                id="profile-email"
                value={form.email}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, email: e.target.value }))
                }
                className={inputCls}
                placeholder="you@company.com"
              />
            </FormField>

            <FormField
              label="Password"
              htmlFor="profile-password"
              error={hasSubmitted ? errors.password : undefined}
            >
              <input
                id="profile-password"
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, password: e.target.value }))
                }
                className={inputCls}
                placeholder="Leave blank to keep current password"
              />
            </FormField>
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              type="submit"
              className="h-10 px-5"
              disabled={!isDirty || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
