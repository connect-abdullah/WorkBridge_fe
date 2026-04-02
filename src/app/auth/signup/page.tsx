import { AuthShell } from "@/components/auth/AuthShell";
import { SignupForm } from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <AuthShell
      title="Create your account"
      description="Set up your WorkBridge workspace in under a minute."
    >
      <SignupForm />
    </AuthShell>
  );
}
