"use client";

import { useAuth } from "@/components/app/AppAuthProvider";
import { useNakuruApp } from "@/components/app/AppProvider";
import { apiFetch, ApiError } from "@/lib/nakuru/api";
import {
  intentFromStartParam,
  signInCopy,
  type SignInIntent,
} from "@/lib/nakuru/sign-in-intent";
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
  /** When set, overrides URL `?start=vendor` for Shop vs Seller UI. */
  intent?: SignInIntent;
  showIntentSwitch?: boolean;
  showGuestBrowse?: boolean;
};

export function EmailOtpForm({
  intent: intentProp,
  showIntentSwitch = true,
  showGuestBrowse = true,
}: Props) {
  const { setSessionFromOtp } = useAuth();
  const { dispatch, toast } = useNakuruApp();
  const { lang } = usePwaInstall();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const intent = useMemo((): SignInIntent => {
    if (intentProp) return intentProp;
    return intentFromStartParam(
      searchParams.get("start"),
      searchParams.has("vendor"),
    );
  }, [intentProp, searchParams]);

  const copy = signInCopy(intent);

  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [remember, setRemember] = useState(false);

  useEffect(() => {
    if (resendIn <= 0) return;
    const id = window.setInterval(
      () => setResendIn((n) => (n > 0 ? n - 1 : 0)),
      1000,
    );
    return () => window.clearInterval(id);
  }, [resendIn]);

  const afterSignIn = useCallback(() => {
    if (intent === "seller") {
      dispatch({ type: "SLIDE_VENDOR" });
    } else {
      dispatch({ type: "SET_ACC", acc: null });
    }
  }, [dispatch, intent]);

  const switchIntent = () => {
    if (intent === "seller") {
      dispatch({ type: "SET_ACC", acc: null });
    } else {
      dispatch({ type: "SLIDE_VENDOR" });
    }
  };

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
      toast(copy.successToast);
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

  const intentSwitch = showIntentSwitch ? (
    <button
      type="button"
      className="btn s o full"
      style={{ marginTop: 12 }}
      disabled={busy}
      onClick={switchIntent}
    >
      {copy.switchLabel}
    </button>
  ) : null;

  if (step === "email") {
    return (
      <form
        className={`card sign-in-card sign-in-card--${intent}`}
        onSubmit={sendCode}
      >
        <h2 style={{ marginTop: 0 }}>{copy.emailTitle}</h2>
        <div className="m">{copy.emailLead}</div>
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
          {busy ? "Sending…" : copy.emailCta}
        </button>
        {intentSwitch}
        {guestBlock}
      </form>
    );
  }

  return (
    <form
      className={`card sign-in-card sign-in-card--${intent}`}
      onSubmit={verifyCode}
    >
      <h2 style={{ marginTop: 0 }}>{copy.codeTitle}</h2>
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
        {busy ? "Verifying…" : copy.codeVerifyCta}
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
      {intentSwitch}
    </form>
  );
}