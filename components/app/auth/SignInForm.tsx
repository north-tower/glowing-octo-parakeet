"use client";

import { useAuth } from "@/components/app/AppAuthProvider";
import { useNakuruApp } from "@/components/app/AppProvider";
import { AuthBackLink } from "@/components/app/auth/AuthBackLink";
import { OtpInput } from "@/components/app/auth/OtpInput";
import { apiFetch, ApiError } from "@/lib/nakuru/api";
import {
  persistAppMode,
  wantsSellingEntry,
} from "@/lib/nakuru/app-mode";
import { appHrefForDetailNavTab } from "@/lib/nakuru/detail-nav-tab";
import { homeCopy } from "@/lib/nakuru/home-i18n";
import { maskEmail } from "@/lib/nakuru/mask-email";
import { consumePostSignInReturn } from "@/lib/nakuru/post-sign-in-tab";
import type { NakuruAction } from "@/lib/nakuru/reducer";
import { usePwaInstall } from "@/components/app/pwa/InstallProvider";
import { useAppDesktopUp } from "@/lib/nakuru/use-media-query";
import { Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";

const RESEND_SECONDS = 30;
const PHONE_AUTH =
  process.env.NEXT_PUBLIC_AUTH_PHONE_ENABLED === "true";

function isValidEmail(raw: string): boolean {
  const s = raw.trim();
  if (s.length < 3 || s.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

type Channel = "email" | "phone";

export type SignInFormProps = {
  variant: "standalone" | "embedded";
  openSellingAfterSignIn?: boolean;
  showGuestBrowse?: boolean;
  showBack?: boolean;
  onBack?: () => void;
  dispatch?: (action: NakuruAction) => void;
  toast?: (message: string) => void;
};

function SignInFormInner({
  variant,
  openSellingAfterSignIn = false,
  showGuestBrowse = true,
  showBack = variant === "standalone",
  onBack,
  dispatch,
  toast = () => undefined,
}: SignInFormProps) {
  const { setSessionFromOtp } = useAuth();
  const { lang } = usePwaInstall();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const desktopUp = useAppDesktopUp();

  const sellingEntry = useMemo(
    () =>
      openSellingAfterSignIn ||
      wantsSellingEntry(searchParams.get("start"), searchParams.has("vendor")),
    [openSellingAfterSignIn, searchParams],
  );

  const [step, setStep] = useState<"email" | "code">("email");
  const [channel, setChannel] = useState<Channel>("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [remember, setRemember] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const submittingRef = useRef(false);

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
    if (variant === "embedded" && dispatch) {
      if (sellingEntry) {
        persistAppMode("selling");
        dispatch({ type: "SLIDE_VENDOR" });
      } else {
        persistAppMode("shopping");
        dispatch({ type: "SET_ACC", acc: null });
      }
      return;
    }

    const { tab, path } = consumePostSignInReturn();
    if (sellingEntry) {
      persistAppMode("selling");
      router.push(path ?? "/app?start=vendor");
      return;
    }
    persistAppMode("shopping");
    if (path) router.push(path);
    else if (tab) router.push(`/app?tab=${tab}`);
    else router.push("/app");
  }, [dispatch, router, sellingEntry, variant]);

  const sendCode = async (ev?: FormEvent) => {
    ev?.preventDefault();
    if (submittingRef.current || busy) return;

    setFormError(null);
    setEmailError(null);
    setStatusMessage(null);

    if (channel === "phone") {
      setFormError("Phone sign-in is coming soon. Use email for now.");
      return;
    }

    const normalized = email.trim().toLowerCase();
    if (!isValidEmail(normalized)) {
      setEmailError("Enter a valid email address");
      return;
    }

    submittingRef.current = true;
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
      setCode("");
      setCodeError(null);
      setResendIn(RESEND_SECONDS);
      setStatusMessage(
        res.devCode
          ? "Dev mode: use the code shown below."
          : "Code sent — check your inbox.",
      );
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Could not send sign-in code";
      setFormError(msg);
    } finally {
      setBusy(false);
      submittingRef.current = false;
    }
  };

  const resend = () => {
    if (resendIn > 0 || busy || submittingRef.current) return;
    void sendCode();
  };

  const verifyCode = useCallback(
    async (digitsOverride?: string) => {
      const digits = (digitsOverride ?? code).replace(/\D/g, "").slice(0, 6);
      if (digits.length !== 6) {
        setCodeError("Enter the 6-digit code");
        return;
      }
      if (submittingRef.current || busy) return;

      submittingRef.current = true;
      setBusy(true);
      setCodeError(null);
      try {
        const data = await apiFetch<{ access: string }>("/api/auth/otp/verify", {
          method: "POST",
          body: JSON.stringify({ email, code: digits, remember }),
          skipAuthRetry: true,
        });
        setSessionFromOtp(data.access, email);
        setStatusMessage(homeCopy("signInSuccess", lang));
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
        setCodeError(msg);
        setCode("");
      } finally {
        setBusy(false);
        submittingRef.current = false;
      }
    },
    [afterSignIn, busy, code, email, lang, remember, setSessionFromOtp, toast],
  );

  const onVerifySubmit = (ev: FormEvent) => {
    ev.preventDefault();
    void verifyCode();
  };

  const browseAsGuest = () => {
    if (variant === "standalone") {
      router.push("/app");
      return;
    }
    dispatch?.({ type: "SET_TAB", tab: "home" });
    dispatch?.({ type: "SET_ACC", acc: null });
    if (pathname?.startsWith("/app/p/")) {
      router.push(appHrefForDetailNavTab());
    }
  };

  const cardChrome =
    variant === "standalone"
      ? "lg:rounded-2xl lg:border lg:border-stone-200/90 lg:bg-white lg:p-8 lg:shadow-sm"
      : "max-lg:border-0 max-lg:bg-transparent max-lg:p-0 max-lg:shadow-none lg:rounded-2xl lg:border lg:border-stone-200/90 lg:bg-white lg:p-8 lg:shadow-sm";

  const emailInvalid = email.trim().length > 0 && !isValidEmail(email.trim());

  if (step === "email") {
    return (
      <div className={`sign-in-card w-full ${cardChrome}`}>
        {showBack ? <AuthBackLink onBack={onBack} /> : null}

        <form onSubmit={sendCode} noValidate>
          <h1 className="text-3xl font-semibold tracking-tight text-stone-900">
            Welcome back
          </h1>
          <p className="mt-2 text-base text-balance text-stone-600">
            Enter your email and we&apos;ll send you a 6-digit code. No password
            needed.
          </p>
          <p className="mt-2 text-sm text-stone-600">
            We&apos;ll send a 6-digit code. It expires in 10 minutes.
          </p>

          {PHONE_AUTH ? (
            <div
              className="mt-6 flex rounded-xl border border-stone-200 bg-stone-100/80 p-1"
              role="tablist"
              aria-label="Sign-in method"
            >
              {(["email", "phone"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={channel === tab}
                  className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                    channel === tab
                      ? "bg-white text-stone-900 shadow-sm"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                  onClick={() => setChannel(tab)}
                >
                  {tab === "email" ? "Email" : "Phone"}
                </button>
              ))}
            </div>
          ) : null}

          {formError ? (
            <p role="alert" className="mt-4 text-sm text-red-600">
              {formError}
            </p>
          ) : null}

          {statusMessage ? (
            <p className="mt-4 text-sm text-emerald-800" aria-live="polite">
              {statusMessage}
            </p>
          ) : null}

          {channel === "email" ? (
            <div className="mt-6">
              <label
                htmlFor="signin-email"
                className="text-sm font-medium text-stone-800"
              >
                Email
              </label>
              <div className="relative mt-1.5">
                <Mail
                  className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400"
                  aria-hidden
                />
                <input
                  id="signin-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  enterKeyHint="send"
                  autoFocus={desktopUp}
                  placeholder="you@example.com"
                  value={email}
                  disabled={busy}
                  aria-invalid={emailError || emailInvalid ? true : undefined}
                  aria-describedby={
                    emailError ? "signin-email-error" : undefined
                  }
                  className={`h-12 w-full rounded-xl border bg-white py-0 pl-11 pr-4 text-base text-stone-900 placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 ${
                    emailError || emailInvalid
                      ? "border-red-400"
                      : "border-stone-300"
                  }`}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError(null);
                    setFormError(null);
                  }}
                />
              </div>
              {emailError ? (
                <p id="signin-email-error" role="alert" className="mt-1.5 text-sm text-red-600">
                  {emailError}
                </p>
              ) : null}
            </div>
          ) : (
            <div className="mt-6">
              <label
                htmlFor="signin-phone"
                className="text-sm font-medium text-stone-800"
              >
                Phone
              </label>
              <div className="mt-1.5 flex gap-2">
                <span className="flex h-12 items-center rounded-xl border border-stone-300 bg-stone-50 px-3 text-base font-medium text-stone-700">
                  +254
                </span>
                <input
                  id="signin-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel-national"
                  placeholder="712 345 678"
                  maxLength={9}
                  value={phone}
                  disabled={busy}
                  className="h-12 min-w-0 flex-1 rounded-xl border border-stone-300 bg-white px-4 text-base text-stone-900"
                  onChange={(e) =>
                    setPhone(e.target.value.replace(/\D/g, "").slice(0, 9))
                  }
                />
              </div>
            </div>
          )}

          <label
            className="mt-4 flex min-h-11 cursor-pointer items-center gap-3"
            htmlFor="signin-remember"
          >
            <input
              id="signin-remember"
              type="checkbox"
              checked={remember}
              disabled={busy}
              className="h-5 w-5 shrink-0 accent-emerald-800"
              onChange={(e) => setRemember(e.target.checked)}
            />
            <span className="text-sm text-stone-700">
              {homeCopy("signInRemember", lang)}
            </span>
          </label>

          <button
            type="submit"
            disabled={
              busy ||
              (channel === "email" &&
                (!email.trim() || !isValidEmail(email.trim()))) ||
              (channel === "phone" && phone.length < 9)
            }
            className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-900 text-base font-semibold text-white transition-colors hover:bg-emerald-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                Sending…
              </>
            ) : (
              homeCopy("signInCta", lang)
            )}
          </button>

          <p className="mt-4 text-center text-xs text-stone-500">
            By continuing you agree to our{" "}
            <Link
              href="/terms"
              className="font-medium text-stone-600 underline-offset-2 hover:text-stone-900 hover:underline"
            >
              Terms
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="font-medium text-stone-600 underline-offset-2 hover:text-stone-900 hover:underline"
            >
              Privacy Policy
            </Link>
            .
          </p>

          {showGuestBrowse ? (
            <>
              <button
                type="button"
                className="sign-in-guest mt-6 w-full text-center text-sm font-semibold text-emerald-900 underline-offset-2 hover:underline"
                disabled={busy}
                onClick={browseAsGuest}
              >
                {homeCopy("signInGuestBrowse", lang)}
              </button>
              <p className="sign-in-guest-note mt-2 text-center text-xs text-stone-500">
                {homeCopy("signInGuestNote", lang)}
              </p>
            </>
          ) : null}
        </form>
      </div>
    );
  }

  return (
    <div className={`sign-in-card w-full ${cardChrome}`}>
      {showBack ? <AuthBackLink onBack={onBack} /> : null}

      <form onSubmit={onVerifySubmit}>
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900">
          Check your email
        </h1>
        <p className="mt-2 text-base text-stone-600">
          We sent a code to{" "}
          <span className="font-medium text-stone-800">{maskEmail(email)}</span>
          .{" "}
          <button
            type="button"
            className="font-medium text-emerald-900 underline-offset-2 hover:underline"
            disabled={busy}
            onClick={() => {
              setStep("email");
              setCode("");
              setCodeError(null);
              setDevCode(null);
              setStatusMessage(null);
            }}
          >
            Change email
          </button>
        </p>

        {devCode ? (
          <div
            className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
            role="status"
            aria-live="polite"
          >
            <p className="font-medium">Development — use this code</p>
            <p className="mt-1 font-mono text-lg tracking-widest">{devCode}</p>
          </div>
        ) : null}

        {statusMessage ? (
          <p className="mt-4 text-sm text-emerald-800" aria-live="polite">
            {statusMessage}
          </p>
        ) : null}

        <div className="mt-8">
          <OtpInput
            value={code}
            onChange={setCode}
            onComplete={(digits) => void verifyCode(digits)}
            disabled={busy}
            error={codeError}
            autoFocus
          />
        </div>

        <button
          type="submit"
          disabled={busy || code.replace(/\D/g, "").length !== 6}
          className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-900 text-base font-semibold text-white transition-colors hover:bg-emerald-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              Verifying…
            </>
          ) : (
            homeCopy("signInVerifyCta", lang)
          )}
        </button>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            className="text-sm font-medium text-stone-600 hover:text-stone-900 disabled:opacity-50"
            disabled={busy || resendIn > 0}
            onClick={resend}
          >
            {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-stone-500">
          Didn&apos;t get it? Check spam or wait for the timer, then resend.
        </p>
      </form>
    </div>
  );
}

type OtpFormProps = Omit<
  SignInFormProps,
  "variant" | "dispatch" | "toast"
>;

/** In-app account tab — requires `AppProvider`. */
export function SignInForm({
  openSellingAfterSignIn,
  showGuestBrowse,
  showBack,
  onBack,
}: OtpFormProps = {}) {
  const { dispatch, toast } = useNakuruApp();
  return (
    <SignInFormInner
      variant="embedded"
      dispatch={dispatch}
      toast={toast}
      openSellingAfterSignIn={openSellingAfterSignIn}
      showGuestBrowse={showGuestBrowse}
      showBack={showBack}
      onBack={onBack}
    />
  );
}

/** Dedicated `/auth/sign-in` page — no `AppProvider`. */
export function StandaloneSignInForm(props: OtpFormProps = {}) {
  return <SignInFormInner variant="standalone" {...props} />;
}