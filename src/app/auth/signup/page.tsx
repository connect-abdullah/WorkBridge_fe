import { Suspense } from "react";
import { Loader2 } from "lucide-react";

import { AuthShell } from "@/components/auth/AuthShell";
import { SignupForm } from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <AuthShell
      title="Create your account"
      description="Set up your WorkBridge workspace in under a minute."
    >
      <Suspense
        fallback={
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <SignupForm />
      </Suspense>
    </AuthShell>
  );
}
