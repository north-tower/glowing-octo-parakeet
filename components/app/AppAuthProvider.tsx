"use client";

import {
  apiFetch,
  refreshAccessToken,
} from "@/lib/nakuru/api";
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
  userFromAccessToken,
  type AuthUser,
} from "@/lib/nakuru/auth";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type AuthContextValue = {
  user: AuthUser | null;
  accessToken: string | null;
  /** Restore session from httpOnly refresh cookie. */
  login: () => Promise<boolean>;
  setSessionFromOtp: (access: string, email: string) => void;
  logout: () => Promise<void>;
  ready: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AppAuthProvider");
  }
  return ctx;
}

type Props = {
  children: ReactNode;
};

export function AppAuthProvider({ children }: Props) {
  const [email, setEmail] = useState<string | undefined>(undefined);
  const [token, setToken] = useState<string | null>(() => getAccessToken());
  const [ready, setReady] = useState(false);

  const syncToken = useCallback((next: string | null) => {
    setAccessToken(next);
    setToken(next);
  }, []);

  const user = useMemo(
    () => userFromAccessToken(token, email),
    [token, email],
  );

  const login = useCallback(async () => {
    const access = await refreshAccessToken();
    if (access) {
      syncToken(access);
      return true;
    }
    syncToken(null);
  }, [syncToken]);

  const setSessionFromOtp = useCallback(
    (access: string, userEmail: string) => {
      setEmail(userEmail);
      syncToken(access);
    },
    [syncToken],
  );

  const logout = useCallback(async () => {
    try {
      await apiFetch("/api/auth/logout", {
        method: "POST",
        skipAuthRetry: true,
      });
    } catch {
      /* clear local session even if network fails */
    } finally {
      setEmail(undefined);
      clearAccessToken();
      setToken(null);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await login();
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [login]);

  const value = useMemo(
    () => ({
      user,
      accessToken: token,
      login,
      setSessionFromOtp,
      logout,
      ready,
    }),
    [user, token, login, setSessionFromOtp, logout, ready],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}