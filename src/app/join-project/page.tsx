import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth/session";
import { JoinProjectClient } from "./JoinProjectClient";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function JoinProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const trimmed = (token ?? "").trim();

  if (!trimmed) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-sm text-muted-foreground">
          This invite link is missing a token.
        </p>
        <Button type="button" variant="outline" asChild>
          <Link href="/dashboard">Go to dashboard</Link>
        </Button>
      </div>
    );
  }

  const session = await getSession();
  if (!session) {
    redirect(`/auth/login?invite=${encodeURIComponent(trimmed)}`);
  }

  return <JoinProjectClient token={trimmed} />;
}
