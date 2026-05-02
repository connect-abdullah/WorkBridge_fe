"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { acceptProjectClientInvite } from "@/lib/apis/projectInvites/projectInvites";
import { queryKeys } from "@/lib/queryApi";
const inviteAcceptInFlight = new Set<string>();

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
  const queryClient = useQueryClient();
  const token = searchParams.get("token")?.trim() ?? "";

  const [phase, setPhase] = useState<"idle" | "working" | "error">("idle");

  useEffect(() => {
    if (!token) {
      setPhase("error");
      return;
    }

    const auth = getStoredToken();
    if (!auth) {
      router.replace(`/auth/login?invite=${encodeURIComponent(token)}`);
      return;
    }

    if (inviteAcceptInFlight.has(token)) {
      return;
    }
    inviteAcceptInFlight.add(token);
    setPhase("working");

    let cancelled = false;

    (async () => {
      try {
        const res = await acceptProjectClientInvite({ token });
        if (cancelled) return;
        if (!res.success || !res.data) {
          toast.error(res.message || "Could not join this project.");
          setPhase("error");
          return;
        }
        const projectId = res.data.id;
        await queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
        toast.success(res.message || "You have joined the project.");
        router.replace(`/projects/${projectId}`);
      } finally {
        inviteAcceptInFlight.delete(token);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, router, queryClient]);

  if (!token) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-sm text-muted-foreground">This invite link is missing a token.</p>
        <Button type="button" variant="outline" onClick={() => router.push("/dashboard")}>
          Go to dashboard
        </Button>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-sm text-destructive">
          This invite is invalid, expired, or your account cannot accept it (client accounts
          only).
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Button type="button" variant="outline" onClick={() => router.push("/auth/login")}>
            Log in
          </Button>
          <Button type="button" onClick={() => router.push("/dashboard")}>
            Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center gap-3 p-6 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">Joining project…</p>
    </div>
  );
}

export default function JoinProjectPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <JoinProjectInner />
    </Suspense>
  );
}
