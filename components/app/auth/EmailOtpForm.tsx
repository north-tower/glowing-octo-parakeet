"use client";

import { useAuth } from "@/components/app/AppAuthProvider";
import { useNakuruApp } from "@/components/app/AppProvider";
import { apiFetch, ApiError } from "@/lib/nakuru/api";
import {
  persistAppMode,
  wantsSellingEntry,
} from "@/lib/nakuru/app-mode";
import { appHrefForDetailNavTab } from "@/lib/nakuru/detail-nav-tab";
import { homeCopy } from "@/lib/nakuru/home-i18n";
import { usePwaInstall } from "@/components/app/pwa/InstallProvider";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

const RESEND_SECONDS = 60;

function isValidEmail(raw: string): boolean {
  const s = raw.trim();
  if (s.length < 3 || s.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

type Props = {
  /** After OTP, open Selling (apply / shop) instead of Account home. */
  openSellingAfterSignIn?: boolean;
  showGuestBrowse?: boolean;
};

export function EmailOtpForm({
  openSellingAfterSignIn = false,
  showGuestBrowse = true,
}: Props) {
  const { setSessionFromOtp } = useAuth();
  const { dispatch, toast } = useNakuruApp();
  const { lang } = usePwaInstall();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const sellingEntry = useMemo(
    () =>
      openSellingAfterSignIn ||
      wantsSellingEntry(searchParams.get("start"), searchParams.has("vendor")),
    [openSellingAfterSignIn, searchParams],
  );

  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [remember, setRemember] = useState(false);

  useEffect(() => {
    if (sellingEntry) persistAppMode("selling");
  }, [sellingEntry]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const id = window.setInterval(
      () => setResendIn((n) => (n > 0 ? n - 1 : 0)),
      1000,
    );
    return () => window.clearInterval(id);
  }, [resendIn]);

  const afterSignIn = useCallback(() => {
    if (sellingEntry) {
      persistAppMode("selling");
      dispatch({ type: "SLIDE_VENDOR" });
    } else {
      persistAppMode("shopping");
      dispatch({ type: "SET_ACC", acc: null });
    }
  }, [dispatch, sellingEntry]);

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
      setDevCode((prev) => res.devCode ?? prev);
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
        body: JSON.stringify({ email, code: digits, remember }),
        skipAuthRetry: true,
      });
      setSessionFromOtp(data.access, email);
      toast(homeCopy("signInSuccess", lang));
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

  const browseAsGuest = () => {
    dispatch({ type: "SET_TAB", tab: "home" });
    dispatch({ type: "SET_ACC", acc: null });
    if (pathname?.startsWith("/app/p/")) {
      router.push(appHrefForDetailNavTab());
    }
  };

  const guestBlock =
    showGuestBrowse && step === "email" ? (
      <>
        <button
          type="button"
          className="sign-in-guest"
          disabled={busy}
          onClick={browseAsGuest}
        >
          {homeCopy("signInGuestBrowse", lang)}
        </button>
        <p className="sign-in-guest-note">{homeCopy("signInGuestNote", lang)}</p>
      </>
    ) : null;

  if (step === "email") {
    return (
      <form className="card sign-in-card" onSubmit={sendCode}>
        <h2 style={{ marginTop: 0 }}>{homeCopy("signInTitle", lang)}</h2>
        <div className="m">{homeCopy("signInLead", lang)}</div>
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
        <label className="sign-in-remember" htmlFor="otp-remember">
          <input
            id="otp-remember"
            type="checkbox"
            checked={remember}
            disabled={busy}
            onChange={(e) => setRemember(e.target.checked)}
          />
          <span>{homeCopy("signInRemember", lang)}</span>
        </label>
        <button type="submit" className="btn full" disabled={busy}>
          {busy ? "Sending…" : homeCopy("signInCta", lang)}
        </button>
        {guestBlock}
      </form>
    );
  }

  return (
    <form className="card sign-in-card" onSubmit={verifyCode}>
      <h2 style={{ marginTop: 0 }}>{homeCopy("signInCodeTitle", lang)}</h2>
      <div className="m">
        Code sent to <strong>{email}</strong>
      </div>
      {devCode ? (
        <div className="otp-dev-banner" role="status" aria-live="polite">
          <div className="m otp-dev-banner-label">
            Development — use this code to sign in
          </div>
          <strong className="otp-dev-code">{devCode}</strong>
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
        {busy ? "Verifying…" : homeCopy("signInVerifyCta", lang)}
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
