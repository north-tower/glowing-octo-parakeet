"use client";

import { StaffLoginForm } from "@/components/staff/StaffLoginForm";
import { StaffConsoleLayout } from "@/components/staff/StaffConsoleLayout";
import { StaffSessionProvider } from "@/components/staff/StaffSessionContext";
import { LoadingBlock } from "@/components/app/loading/LoadingUi";
import { ApiError } from "@/lib/nakuru/api";
import {
  clearStaffAccessToken,
  getStaffAccessToken,
} from "@/lib/nakuru/staff-auth";
import { staffFetch, type StaffMe } from "@/lib/nakuru/staff-api";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";

export function StaffAuthShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [me, setMe] = useState<StaffMe | null>(null);

  const loadSession = useCallback(async () => {
    if (!getStaffAccessToken()) {
      setMe(null);
      return;
    }
    try {
      const row = await staffFetch<StaffMe>("/api/admin/me");
      setMe(row);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        clearStaffAccessToken();
      }
      setMe(null);
    }
  }, []);

  useEffect(() => {
    void loadSession().finally(() => setReady(true));
  }, [loadSession]);

  const signOut = useCallback(() => {
    clearStaffAccessToken();
    void fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    }).finally(() => {
      setMe(null);
      router.replace("/staff");
    });
  }, [router]);

  const onLoggedIn = useCallback(
    (_access: string, role?: "admin" | "support") => {
      void (async () => {
        try {
          const row = await staffFetch<StaffMe>("/api/admin/me");
          setMe(row);
          if (row.role === "support" || role === "support") {
            router.replace("/staff/vendors");
          } else {
            router.replace("/staff");
          }
        } catch {
          clearStaffAccessToken();
          setMe(null);
        }
      })();
    },
    [router],
  );

  if (!ready) {
    return <LoadingBlock label="Loading operations console…" />;
  }

  if (!me) {
    return (
      <main className="staff-ops-login">
        <StaffLoginForm onLoggedIn={onLoggedIn} />
      </main>
    );
  }

  return (
    <StaffSessionProvider me={me} signOut={signOut}>
      <StaffConsoleLayout>{children}</StaffConsoleLayout>
    </StaffSessionProvider>
  );
}