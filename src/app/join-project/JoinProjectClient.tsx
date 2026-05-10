"use client";

import { useRouter } from "next/navigation";

import { ProjectClientInviteFromNotificationModal } from "@/components/notifications/ProjectClientInviteFromNotificationModal";

export function JoinProjectClient({ token }: { token: string }) {
  const router = useRouter();
  return (
    <ProjectClientInviteFromNotificationModal
      open
      token={token}
      onClose={() => router.replace("/dashboard")}
    />
  );
}
