import { AuthShell } from "@/components/app/auth/AuthShell";
import { StandaloneSignInForm } from "@/components/app/auth/SignInForm";

export default function SignInPage() {
  return (
    <AuthShell>
      <StandaloneSignInForm />
    </AuthShell>
  );
}