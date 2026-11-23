"use client";

import { AppAuthProvider } from "@/components/app/AppAuthProvider";
import { InstallProvider } from "@/components/app/pwa/InstallProvider";
import { Suspense, type ReactNode } from "react";

export function AuthProviders({ children }: { children: ReactNode }) {
  return (
    <AppAuthProvider>
      <InstallProvider>
        <Suspense fallback={null}>{children}</Suspense>
      </InstallProvider>
    </AppAuthProvider>
  );
}