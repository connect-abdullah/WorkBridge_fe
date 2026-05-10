import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

import ProfilePage from "@/components/profile/profile-page";
import { getCurrentUser } from "@/lib/server-api/server/auth";
import { requireSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function ProfileRoute() {
  await requireSession();

  const queryClient = new QueryClient();
  const me = await getCurrentUser();
  if (me) {
    queryClient.setQueryData(["profile", "me"], {
      success: true,
      message: "",
      data: me,
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProfilePage />
    </HydrationBoundary>
  );
}
