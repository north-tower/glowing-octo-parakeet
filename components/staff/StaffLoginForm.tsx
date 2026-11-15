"use client";

import { setStaffAccessToken } from "@/lib/nakuru/staff-auth";
import { useCallback, useState, type FormEvent } from "react";

type Props = {
  onLoggedIn: (access: string) => void;
};

function isValidEmail(raw: string): boolean {
  const s = raw.trim();
  if (s.length < 3 || s.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function apiBase(): string {
  const raw = process.env.NEXT_PUBLIC_API_BASE ?? "";
  return raw.replace(/\/$/, "");
}

function resolveUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  const base = apiBase();
  return base ? `${base}${p}` : p;
}

export function StaffLoginForm({ onLoggedIn }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totp, setTotp] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (ev: FormEvent) => {
      ev.preventDefault();
      setError(null);

      const normalized = email.trim().toLowerCase();
      if (!isValidEmail(normalized)) {
        setError("Enter a valid staff email.");
        return;
      }
      if (password.length < 12) {
        setError("Password must be at least 12 characters.");
        return;
      }
      if (!/^\d{6}$/.test(totp)) {
        setError("Enter the 6-digit code from your authenticator app.");
        return;
      }

      setBusy(true);
      try {
        const res = await fetch(resolveUrl("/api/auth/staff/login"), {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "nakuruhub",
          },
          body: JSON.stringify({ email: normalized, password, totp }),
        });
        const data = (await res.json().catch(() => null)) as {
          access?: string;
          error?: string;
        } | null;

        if (!res.ok || !data?.access) {
          const msg =
            data?.error === "invalid_credentials"
              ? "Invalid email, password, or authenticator code."
              : "Could not sign in.";
          setError(msg);
          return;
        }

        setStaffAccessToken(data.access);
        onLoggedIn(data.access);
      } catch {
        setError("Network error. Try again.");
      } finally {
        setBusy(false);
      }
    },
    [email, onLoggedIn, password, totp],
  );

  return (
    <form onSubmit={submit}>
      <h2>Staff sign-in</h2>
      <p className="m" style={{ marginBottom: 12 }}>
        Password and authenticator required. Customer OTP does not grant staff
        access.
      </p>
      {error ? <div className="err">{error}</div> : null}
      <label htmlFor="staff-email">Work email</label>
      <input
        id="staff-email"
        type="email"
        autoComplete="username"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={busy}
        required
      />
      <label htmlFor="staff-password">Password</label>
      <input
        id="staff-password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={busy}
        required
        minLength={12}
      />
      <label htmlFor="staff-totp">Authenticator code</label>
      <input
        id="staff-totp"
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="\d{6}"
        maxLength={6}
        value={totp}
        onChange={(e) => setTotp(e.target.value.replace(/\D/g, "").slice(0, 6))}
        disabled={busy}
        required
      />
      <button type="submit" className="btn full" disabled={busy} style={{ marginTop: 14 }}>
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}