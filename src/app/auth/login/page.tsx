import { Suspense } from "react";

import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      description="Log in to manage projects, milestones, and payments."
    >
      <Suspense
        fallback={
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
