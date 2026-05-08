"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { ProjectClientInviteFromNotificationModal } from "@/components/notifications/ProjectClientInviteFromNotificationModal";
import { Button } from "@/components/ui/button";

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("auth:token");
  } catch {
    return null;
  }
}

function JoinProjectInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    if (!token) return;
    const auth = getStoredToken();
    if (!auth) {
      router.replace(`/auth/login?invite=${encodeURIComponent(token)}`);
      return;
    }
    setAuthReady(true);
  }, [token, router]);

  if (!token) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-sm text-muted-foreground">
          This invite link is missing a token.
        </p>
        <Button type="button" variant="outline" onClick={() => router.push("/dashboard")}>
          Go to dashboard
        </Button>
      </div>
    );
  }

  if (!authReady) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden />
      </div>
    );
  }

  return (
    <ProjectClientInviteFromNotificationModal
      open
      token={token}
      onClose={() => router.replace("/dashboard")}
    />
  );
}

export default function JoinProjectPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden />
        </div>
      }
    >
      <JoinProjectInner />
    </Suspense>
  );
}
