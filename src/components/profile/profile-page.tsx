"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FormField, inputCls } from "@/components/ui/form-field";
import {
  getEmailValidationError,
  getNameValidationError,
  getPasswordValidationError,
} from "@/lib/utils";
import type { UserRead } from "@/lib/apis/auth/schema";
import { getProfile, updateProfile } from "@/lib/apis/auth/auth";
import { handleUpload } from "@/lib/supabase";

type ProfileFormValues = {
  name: string;
  email: string;
  password: string;
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  const initials = `${first}${last}`.toUpperCase();
  return initials || "U";
}

function readStoredUser(): UserRead | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("auth:user");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as UserRead;
  } catch {
    return null;
  }
}

export default function ProfilePage() {
  const storedUser = readStoredUser();
  const [user, setUser] = useState<UserRead | null>(storedUser);

  const initialValues = useRef<ProfileFormValues>({
    name: storedUser?.name ?? "",
    email: storedUser?.email ?? "",
    password: "",
  });

  const [form, setForm] = useState<ProfileFormValues>(initialValues.current);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof ProfileFormValues, string>>
  >({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const profileQuery = useQuery({
    queryKey: ["profile", "me"],
    queryFn: () => getProfile(),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled: typeof window !== "undefined" && !!localStorage.getItem("auth:token"),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: Parameters<typeof updateProfile>[0]) =>
      updateProfile(payload),
  });

  useEffect(() => {
    const res = profileQuery.data;
    if (!res || res.success === false || !res.data) return;
    const me = res.data;
    setUser(me);
    try {
      localStorage.setItem("auth:user", JSON.stringify(me));
    } catch {}
    initialValues.current = { name: me.name, email: me.email, password: "" };
    setForm((prev) => ({
      ...prev,
      name: me.name,
      email: me.email,
    }));
  }, [profileQuery.data]);

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
    setAvatarFile(file);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setHasSubmitted(true);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      let avatarUrl: string | undefined;
      if (avatarFile && avatarPreview) {
        avatarUrl = await handleUpload(avatarFile);
      }

      const payload: Parameters<typeof updateProfile>[0] = {
        name: form.name !== initialValues.current.name ? form.name : undefined,
        email:
          form.email !== initialValues.current.email ? form.email : undefined,
        password: form.password.trim() ? form.password : undefined,
        avatar: avatarUrl,
      };

      const res = await updateMutation.mutateAsync(payload);
      if (!res.success) {
        toast.error(res.message || "Failed to update profile.");
        return;
      }
      if (res.data) {
        setUser(res.data);
        try {
          localStorage.setItem("auth:user", JSON.stringify(res.data));
        } catch {}
        try {
          window.dispatchEvent(new Event("auth:user-updated"));
        } catch {}
      }

      initialValues.current = { ...form, password: "" };
      setForm((prev) => ({ ...prev, password: "" }));
      setAvatarPreview(null);
      setAvatarFile(null);
      setHasSubmitted(false);
      setErrors({});
      if (fileInputRef.current) fileInputRef.current.value = "";

      toast.success(res.message || "Profile updated.");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update profile.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
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
              ) : user?.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatar}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                getInitials(user?.name ?? form.name ?? "")
              )}
            </button>
            <p className="mt-2 text-xs text-muted-foreground">
              Click avatar to change
            </p>
            <p className="mt-3 text-lg font-semibold text-foreground">
              {user?.name ?? form.name ?? "—"}
            </p>
            <span className="mt-1 inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
              {user?.role === "freelancer" ? "Freelancer" : "Client"}
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
