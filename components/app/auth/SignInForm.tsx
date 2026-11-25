"use client";

import { useAuth } from "@/components/app/AppAuthProvider";
import { useNakuruApp } from "@/components/app/AppProvider";
import { AuthBackLink } from "@/components/app/auth/AuthBackLink";
import { OtpInput } from "@/components/app/auth/OtpInput";
import { IconCheck, IconMail } from "@/components/app/icons/LineIcons";
import {
  persistAppMode,
  wantsSellingEntry,
} from "@/lib/nakuru/app-mode";
import { appHrefForDetailNavTab } from "@/lib/nakuru/detail-nav-tab";
import { homeCopy } from "@/lib/nakuru/home-i18n";
import { maskEmail } from "@/lib/nakuru/mask-email";
import {
  isClientOtpDemo,
  isValidEmail,
  OtpAdapterError,
  requestSignInCode,
  verifySignInCode,
} from "@/lib/nakuru/otp-adapter";
import { consumePostSignInReturn } from "@/lib/nakuru/post-sign-in-tab";
import type { NakuruAction } from "@/lib/nakuru/reducer";
import { usePwaInstall } from "@/components/app/pwa/InstallProvider";
import { useAppDesktopUp } from "@/lib/nakuru/use-media-query";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";

const RESEND_SECONDS = 30;
const SUCCESS_MS = 700;
const PHONE_AUTH = process.env.NEXT_PUBLIC_AUTH_PHONE_ENABLED === "true";

type Channel = "email" | "phone";
type Step = "email" | "code" | "success";

export type SignInIntent = "orders" | "saved" | null;

export type SignInFormProps = {
  variant: "standalone" | "embedded";
  openSellingAfterSignIn?: boolean;
  showGuestBrowse?: boolean;
  showBack?: boolean;
  onBack?: () => void;
  dispatch?: (action: NakuruAction) => void;
  toast?: (message: string) => void;
  intent?: SignInIntent;
};

function SignInFormInner({
  variant,
  openSellingAfterSignIn = false,
  showGuestBrowse = true,
  showBack = variant === "standalone",
  onBack,
  dispatch,
  toast = () => undefined,
  intent = null,
}: SignInFormProps) {
  const { setSessionFromOtp } = useAuth();
  const { lang } = usePwaInstall();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const desktopUp = useAppDesktopUp();
  const headingId = useId();

  const sellingEntry = useMemo(
    () =>
      openSellingAfterSignIn ||
      wantsSellingEntry(searchParams.get("start"), searchParams.has("vendor")),
    [openSellingAfterSignIn, searchParams],
  );

  const [step, setStep] = useState<Step>("email");
  const [channel, setChannel] = useState<Channel>("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [remember, setRemember] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
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

  const validateEmailField = (raw: string): boolean => {
    if (isValidEmail(raw)) {
      setEmailError(null);
      return true;
    }
    setEmailError(homeCopy("signInEmailError", lang));
    return false;
  };

  const sendCode = async (ev?: FormEvent) => {
    ev?.preventDefault();
    if (submittingRef.current || busy) return;

    setFormError(null);
    setStatusMessage(null);
    setEmailTouched(true);

    if (channel === "phone") {
      setFormError(homeCopy("signInPhoneSoon", lang));
      return;
    }

    const normalized = email.trim().toLowerCase();
    if (!validateEmailField(normalized)) return;

    submittingRef.current = true;
    setBusy(true);
    try {
      const res = await requestSignInCode(normalized);
      setEmail(normalized);
      setDevCode((prev) => res.devCode ?? prev);
      setStep("code");
      setCode("");
      setCodeError(null);
      setResendIn(RESEND_SECONDS);
      setStatusMessage(
        res.devCode && !isClientOtpDemo()
          ? "Dev mode: use the code shown below."
          : null,
      );
    } catch (err) {
      if (err instanceof OtpAdapterError && err.code === "rate_limited") {
        setFormError(homeCopy("signInRateLimit", lang));
      } else {
        setFormError(
          err instanceof OtpAdapterError
            ? err.message
            : "Could not send sign-in code",
        );
      }
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
        setCodeError(homeCopy("signInWrongCode", lang));
        return;
      }
      if (submittingRef.current || busy) return;

      submittingRef.current = true;
      setBusy(true);
      setCodeError(null);
      try {
        const data = await verifySignInCode(email, digits, remember);
        setSessionFromOtp(data.access, email);
        setStep("success");
        setStatusMessage(homeCopy("signInSuccess", lang));
        toast(homeCopy("signInSuccess", lang));
        window.setTimeout(() => afterSignIn(), SUCCESS_MS);
      } catch (err) {
        let msg = homeCopy("signInWrongCode", lang);
        if (err instanceof OtpAdapterError) {
          if (err.code === "expired") msg = homeCopy("signInExpired", lang);
          else if (err.code === "rate_limited") msg = homeCopy("signInRateLimit", lang);
          else if (err.code === "use_staff_login") {
            msg = "Staff accounts must use the staff login page";
          } else if (err.code === "disabled") msg = "This account is disabled";
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

  const emailValid = isValidEmail(email);
  const canSubmitEmail =
    channel === "email" ? emailValid : phone.length >= 9;
  const contextCopy =
    intent === "orders"
      ? homeCopy("signInContextOrders", lang)
      : intent === "saved"
        ? homeCopy("signInContextSaved", lang)
        : null;

  if (step === "success") {
    return (
      <div className="sign-in-card">
        <div className="sign-in-success sign-in-step" role="status" aria-live="polite">
          <span className="sign-in-success-mark" aria-hidden>
            <IconCheck size={28} />
          </span>
          <p className="sign-in-lead">{homeCopy("signInSuccess", lang)}</p>
        </div>
      </div>
    );
  }

  if (step === "email") {
    return (
      <div className="sign-in-card">
        {showBack ? <AuthBackLink onBack={onBack} /> : null}

        <form className="sign-in-step" onSubmit={sendCode} noValidate>
          {contextCopy ? (
            <p className="sign-in-context" role="status">
              {contextCopy}
            </p>
          ) : null}
          <h1 id={headingId}>{homeCopy("signInTitle", lang)}</h1>
          <p className="sign-in-lead">{homeCopy("signInLead", lang)}</p>
          <p className="sign-in-help">{homeCopy("signInHelper", lang)}</p>

          {PHONE_AUTH ? (
            <div
              className="sign-in-channel"
              role="tablist"
              aria-label="Sign-in method"
            >
              {(["email", "phone"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={channel === tab}
                  className="flex-1 rounded-lg py-2 text-sm font-medium"
                  onClick={() => setChannel(tab)}
                >
                  {tab === "email" ? "Email" : "Phone"}
                </button>
              ))}
            </div>
          ) : null}

          <div className="sign-in-status is-error" role="alert" aria-live="assertive">
            {formError ?? "\u00a0"}
          </div>

          {channel === "email" ? (
            <div className="sign-in-field-wrap">
              <label htmlFor="signin-email">
                {homeCopy("signInEmailLabel", lang)}
              </label>
              <div className="sign-in-field">
                <span className="sign-in-field-ico" aria-hidden>
                  <IconMail size={20} />
                </span>
                <input
                  id="signin-email"
                  className={`sign-in-input${emailError ? " is-invalid" : ""}`}
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
                  aria-invalid={emailError ? true : undefined}
                  aria-describedby="signin-email-error"
                  onBlur={() => {
                    setEmailTouched(true);
                    if (email.trim()) validateEmailField(email);
                  }}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setFormError(null);
                    if (emailTouched) validateEmailField(e.target.value);
                    else setEmailError(null);
                  }}
                />
              </div>
              <p id="signin-email-error" className="sign-in-field-error" role="alert">
                {emailError ?? "\u00a0"}
              </p>
            </div>
          ) : (
            <div className="sign-in-field-wrap">
              <label htmlFor="signin-phone">Phone</label>
              <div className="mt-1.5 flex gap-2">
                <span className="flex h-12 items-center rounded-xl border px-3 text-base font-medium">
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
                  className="sign-in-input sign-in-input--plain"
                  onChange={(e) =>
                    setPhone(e.target.value.replace(/\D/g, "").slice(0, 9))
                  }
                />
              </div>
            </div>
          )}

          <label className="sign-in-remember" htmlFor="signin-remember">
            <span className="sign-in-check">
              <input
                id="signin-remember"
                type="checkbox"
                checked={remember}
                disabled={busy}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span className="sign-in-check-ui" aria-hidden />
            </span>
            <span>{homeCopy("signInRemember", lang)}</span>
          </label>

          <button
            type="submit"
            className={`sign-in-submit${busy ? " is-busy" : ""}`}
            disabled={busy || !canSubmitEmail}
          >
            {busy ? (
              <>
                <span className="sign-in-spin" aria-hidden />
                {homeCopy("signInSending", lang)}
              </>
            ) : (
              homeCopy("signInCta", lang)
            )}
          </button>

          <p className="sign-in-legal">
            {homeCopy("signInTermsBefore", lang)}{" "}
            <Link href="/terms">{homeCopy("signInTerms", lang)}</Link>{" "}
            and{" "}
            <Link href="/privacy">{homeCopy("signInPrivacy", lang)}</Link>.
          </p>

          {showGuestBrowse ? (
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
          ) : null}
        </form>
      </div>
    );
  }

  return (
    <div className="sign-in-card">
      {showBack ? <AuthBackLink onBack={onBack} /> : null}

      <form className="sign-in-step" onSubmit={onVerifySubmit}>
        <h1 id={headingId}>{homeCopy("signInCodeTitle", lang)}</h1>
        <p className="sign-in-lead">
          {homeCopy("signInCodeSent", lang).replace("{email}", maskEmail(email))}
          .{" "}
          <button
            type="button"
            className="sign-in-link"
            disabled={busy}
            onClick={() => {
              setStep("email");
              setCode("");
              setCodeError(null);
              setDevCode(null);
              setStatusMessage(null);
            }}
          >
            {homeCopy("signInChangeEmail", lang)}
          </button>
        </p>
        <p className="sign-in-help">{homeCopy("signInExpiry", lang)}</p>

        {devCode ? (
          <div className="otp-dev-banner" role="status" aria-live="polite">
            <p className="otp-dev-banner-label">Development — use this code</p>
            <p className="otp-dev-code">{devCode}</p>
          </div>
        ) : null}

        <div className="sign-in-status" aria-live="polite">
          {statusMessage ?? "\u00a0"}
        </div>

        <div className="mt-2">
          <OtpInput
            value={code}
            onChange={setCode}
            onComplete={(digits) => void verifyCode(digits)}
            disabled={busy}
            error={codeError}
            autoFocus
            labelledBy={headingId}
          />
        </div>

        <button
          type="submit"
          className={`sign-in-submit${busy ? " is-busy" : ""}`}
          disabled={busy || code.replace(/\D/g, "").length !== 6}
        >
          {busy ? (
            <>
              <span className="sign-in-spin" aria-hidden />
              {homeCopy("signInVerifying", lang)}
            </>
          ) : (
            homeCopy("signInVerifyCta", lang)
          )}
        </button>

        <div className="otp-actions">
          <button
            type="button"
            className="sign-in-link"
            disabled={busy || resendIn > 0}
            onClick={resend}
          >
            {resendIn > 0
              ? homeCopy("signInResendIn", lang).replace("{n}", String(resendIn))
              : homeCopy("signInResend", lang)}
          </button>
        </div>
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
  intent,
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
      intent={intent}
    />
  );
}

/** Dedicated `/auth/sign-in` page — no `AppProvider`. */
export function StandaloneSignInForm(props: OtpFormProps = {}) {
  return <SignInFormInner variant="standalone" {...props} />;
}
