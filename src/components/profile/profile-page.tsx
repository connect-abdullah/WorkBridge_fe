"use client";

import {
  ChangeEvent,
  FormEvent,
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2, Mail, Shield, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { Button } from "@/components/ui/button";
import { ProfilePageSkeleton } from "@/components/skeletons";
import { FormField, inputCls } from "@/components/ui/form-field";
import { useIsMobile } from "@/hooks/useIsMobile";
import type { UserRead } from "@/lib/apis/auth/schema";
import { getProfile, updateProfile } from "@/lib/apis/auth/auth";
import { useSessionUser } from "@/lib/auth/user-context";
import { handleUpload } from "@/lib/supabase";
import {
  cn,
  getEmailValidationError,
  getNameValidationError,
  getPasswordValidationError,
} from "@/lib/utils";

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

function trimmedAvatarSrc(user: UserRead | null | undefined): string | null {
  const v = user?.avatar;
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t || null;
}

function formatMemberDate(iso: string | null | undefined) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const SectionCard = memo(function SectionCard({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border/80 bg-card p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6",
        className,
      )}
    >
      <div className="mb-5 space-y-1">
        <h2 className="text-base font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
});

export default function ProfilePage() {
  const sessionUser = useSessionUser();
  const [user, setUser] = useState<UserRead | null>(sessionUser as UserRead);
  const isMobileLayout = useIsMobile();

  const initialValues = useRef<ProfileFormValues>({
    name: sessionUser.name ?? "",
    email: sessionUser.email ?? "",
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
  const [storedAvatarLoadFailed, setStoredAvatarLoadFailed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const profileQuery = useQuery({
    queryKey: ["profile", "me"],
    queryFn: () => getProfile(),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
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
    initialValues.current = { name: me.name, email: me.email, password: "" };
    setForm((prev) => ({
      ...prev,
      name: me.name,
      email: me.email,
    }));
  }, [profileQuery.data]);

  const displayName = user?.name ?? form.name ?? "—";
  const storedAvatarUrl = trimmedAvatarSrc(user);

  useEffect(() => {
    setStoredAvatarLoadFailed(false);
  }, [storedAvatarUrl]);

  const isDirty = useMemo(() => {
    return (
      form.name !== initialValues.current.name ||
      form.email !== initialValues.current.email ||
      form.password.length > 0 ||
      avatarPreview !== null
    );
  }, [form, avatarPreview]);

  const roleLabel = user?.role === "freelancer" ? "Freelancer" : "Client";
  const paidSince = formatMemberDate(user?.paid_date);

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
        avatarUrl = await handleUpload(avatarFile, sessionUser.id);
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

  const showProfileSkeleton =
    profileQuery.isFetching && !profileQuery.data;

  if (showProfileSkeleton) {
    return <ProfilePageSkeleton />;
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 sm:space-y-8">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onAvatarChange}
        className="hidden"
      />

      {/* Hero / profile header */}
      <section className="relative overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.08] via-transparent to-muted/40"
          aria-hidden
        />
        <div className="relative flex flex-col items-center gap-6 p-6 sm:flex-row sm:items-center sm:gap-8 sm:p-8">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="group relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-muted text-2xl font-semibold text-foreground shadow-md ring-2 ring-background ring-offset-2 ring-offset-card transition hover:ring-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:h-28 sm:w-28"
            aria-label="Change profile photo"
          >
            {avatarPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarPreview}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : storedAvatarUrl && !storedAvatarLoadFailed ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={storedAvatarUrl}
                alt=""
                className="h-full w-full object-cover"
                onError={() => setStoredAvatarLoadFailed(true)}
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center">
                {getInitials(displayName)}
              </span>
            )}
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 to-transparent py-2 text-center text-[10px] font-medium text-foreground opacity-0 transition group-hover:opacity-100">
              Change
            </span>
          </button>

          <div className="min-w-0 flex-1 space-y-3 text-center sm:text-left">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Your profile
              </p>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                {displayName}
              </h1>
              <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-muted-foreground sm:justify-start">
                <Mail className="hidden h-4 w-4 shrink-0 sm:inline" aria-hidden />
                <span className="truncate">{user?.email ?? form.email}</span>
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <span className="inline-flex items-center rounded-full border border-border bg-background/80 px-3 py-1 text-xs font-medium text-foreground shadow-sm backdrop-blur-sm">
                <Shield className="mr-1.5 h-3.5 w-3.5 text-primary" aria-hidden />
                {roleLabel}
              </span>
              {user?.paid_user ? (
                <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                  {paidSince ? `Member since ${paidSince}` : "Paid member"}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-12 lg:gap-8 lg:items-start">
        <div className="space-y-6 lg:col-span-7 xl:col-span-8">
          <SectionCard
            title="Personal information"
            description="Update how your name and sign-in details appear across WorkBridge."
          >
            <form onSubmit={onSubmit} className="space-y-5">
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
                    autoComplete="name"
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
                    autoComplete="email"
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
                    autoComplete="new-password"
                  />
                </FormField>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-border/80 pt-5 sm:flex-row sm:justify-end">
                <Button
                  type="submit"
                  className="h-10 px-6 sm:min-w-[8.5rem]"
                  disabled={!isDirty || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    "Save changes"
                  )}
                </Button>
              </div>
            </form>
          </SectionCard>
        </div>

        <aside className="space-y-6 lg:col-span-5 xl:col-span-4">
          {isMobileLayout ? (
            <SectionCard
              title="Appearance"
              description="Switch between light and dark mode."
            >
              <div className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-muted/30 px-4 py-3">
                <span className="text-sm font-medium text-foreground">
                  Theme
                </span>
                <AnimatedThemeToggler />
              </div>
            </SectionCard>
          ) : null}

          {/* <SectionCard
            title="Account"
            description="A quick snapshot of your WorkBridge account."
          >
            <dl className="space-y-0 divide-y divide-border/80 rounded-xl border border-border/60 bg-muted/20">
              <div className="flex items-start justify-between gap-3 px-4 py-3.5">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  User ID
                </dt>
                <dd className="text-sm font-mono font-medium text-foreground tabular-nums">
                  {user?.id ?? "—"}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-3 px-4 py-3.5">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Email
                </dt>
                <dd className="max-w-[60%] break-all text-right text-sm text-foreground">
                  {user?.email ?? form.email}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-3 px-4 py-3.5">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Role
                </dt>
                <dd className="text-sm font-medium text-foreground">
                  {roleLabel}
                </dd>
              </div>
              {paidSince ? (
                <div className="flex items-start justify-between gap-3 px-4 py-3.5">
                  <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                    Member since
                  </dt>
                  <dd className="text-sm text-foreground">{paidSince}</dd>
                </div>
              ) : null}
            </dl>
          </SectionCard> */}
        </aside>
      </div>
    </div>
  );
}
