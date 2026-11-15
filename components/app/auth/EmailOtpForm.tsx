"use client";

import { useAuth } from "@/components/app/AppAuthProvider";
import { useNakuruApp } from "@/components/app/AppProvider";
import { apiFetch, ApiError } from "@/lib/nakuru/api";
import { useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from "react";

const RESEND_SECONDS = 60;

function isValidEmail(raw: string): boolean {
  const s = raw.trim();
  if (s.length < 3 || s.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export function EmailOtpForm() {
  const { setSessionFromOtp } = useAuth();
  const { dispatch, toast } = useNakuruApp();
  const searchParams = useSearchParams();
  const vendorEntry =
    searchParams.get("start") === "vendor" || searchParams.has("vendor");

  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [devCode, setDevCode] = useState<string | null>(null);

  useEffect(() => {
    if (resendIn <= 0) return;
    const id = window.setInterval(
      () => setResendIn((n) => (n > 0 ? n - 1 : 0)),
      1000,
    );
    return () => window.clearInterval(id);
  }, [resendIn]);

  const afterSignIn = useCallback(() => {
    if (vendorEntry) {
      dispatch({ type: "SLIDE_VENDOR" });
    }
  }, [dispatch, vendorEntry]);

  const sendCode = async (ev?: FormEvent) => {
    ev?.preventDefault();
    const normalized = email.trim().toLowerCase();
    if (!isValidEmail(normalized)) {
      toast("Enter a valid email address");
      return;
    }
    setBusy(true);
    try {
      const res = await apiFetch<{ ok: boolean; devCode?: string }>(
        "/api/auth/otp/request",
        {
          method: "POST",
          body: JSON.stringify({ email: normalized }),
          skipAuthRetry: true,
        },
      );
      setEmail(normalized);
      setDevCode(res.devCode ?? null);
      setStep("code");
      setResendIn(RESEND_SECONDS);
      toast(
        res.devCode
          ? "Dev mode: use the code shown below"
          : "Check your email for a 6-digit code",
      );
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Could not send sign-in code";
      toast(msg);
    } finally {
      setBusy(false);
    }
  };

  const resend = () => {
    if (resendIn > 0 || busy) return;
    void sendCode();
  };

  const verifyCode = async (ev: FormEvent) => {
    ev.preventDefault();
    const digits = code.replace(/\D/g, "").slice(0, 6);
    if (digits.length !== 6) {
      toast("Enter the 6-digit code");
      return;
    }
    setBusy(true);
    try {
      const data = await apiFetch<{ access: string }>("/api/auth/otp/verify", {
        method: "POST",
        body: JSON.stringify({ email, code: digits }),
        skipAuthRetry: true,
      });
      setSessionFromOtp(data.access, email);
      toast("Signed in");
      afterSignIn();
    } catch (err) {
      let msg = "Verification failed";
      if (err instanceof ApiError) {
        const codeErr = err.body.error;
        if (codeErr === "invalid_code") msg = "Invalid or expired code";
        else if (codeErr === "use_staff_login") {
          msg = "Staff accounts must use the staff login page";
        } else if (codeErr === "disabled") msg = "This account is disabled";
        else msg = err.message;
      }
      toast(msg);
    } finally {
      setBusy(false);
    }
  };

  if (step === "email") {
    return (
      <form className="card" onSubmit={sendCode}>
        <h2 style={{ marginTop: 0 }}>Sign in with email</h2>
        <div className="m">
          We&apos;ll send a one-time code. No password needed.
        </div>
        <label htmlFor="otp-email">Email</label>
        <input
          id="otp-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          disabled={busy}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit" className="btn full" disabled={busy}>
          {busy ? "Sending…" : "Send code"}
        </button>
      </form>
    );
  }

  return (
    <form className="card" onSubmit={verifyCode}>
      <h2 style={{ marginTop: 0 }}>Enter your code</h2>
      <div className="m">
        Code sent to <strong>{email}</strong>
      </div>
      {devCode ? (
        <div
          className="card"
          role="status"
          style={{
            marginBottom: 12,
            padding: 12,
            border: "1px dashed var(--border, #888)",
          }}
        >
          <div className="m" style={{ marginBottom: 4 }}>
            Dev only — Mailgun not in use yet
          </div>
          <strong style={{ fontSize: "1.5rem", letterSpacing: "0.25em" }}>
            {devCode}
          </strong>
        </div>
      ) : null}
      <label htmlFor="otp-code">6-digit code</label>
      <input
        id="otp-code"
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="\d{6}"
        maxLength={6}
        placeholder="000000"
        value={code}
        disabled={busy}
        onChange={(e) =>
          setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
        }
      />
      <button type="submit" className="btn full" disabled={busy}>
        {busy ? "Verifying…" : "Verify and sign in"}
      </button>
      <div className="row" style={{ marginTop: 12, gap: 8, flexWrap: "wrap" }}>
        <button
          type="button"
          className="btn s"
          disabled={busy}
          onClick={() => {
            setStep("email");
            setCode("");
            setDevCode(null);
          }}
        >
          Change email
        </button>
        <button
          type="button"
          className="btn s o"
          disabled={busy || resendIn > 0}
          onClick={resend}
        >
          {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
        </button>
      </div>
    </form>
  );
}