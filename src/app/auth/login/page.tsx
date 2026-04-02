import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      description="Log in to manage projects, milestones, and payments."
    >
      <LoginForm />
    </AuthShell>
  );
}
