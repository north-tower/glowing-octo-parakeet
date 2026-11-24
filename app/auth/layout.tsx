import type { Metadata } from "next";
import AuthBody from "@/app/auth/AuthBody";
import { AuthProviders } from "@/app/auth/AuthProviders";
import { AuthHeader } from "@/components/app/auth/AuthHeader";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: LayoutProps<"/auth">) {
  return (
    <AuthBody>
      <AuthProviders>
        <div className="flex min-h-dvh flex-col bg-[var(--bg)]">
          <AuthHeader />
          {children}
        </div>
      </AuthProviders>
    </AuthBody>
  );
}