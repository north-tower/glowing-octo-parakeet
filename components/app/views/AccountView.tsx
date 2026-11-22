"use client";

import { EmailOtpForm } from "@/components/app/auth/EmailOtpForm";
import { AccountSignedInView } from "@/components/app/account/AccountSignedInView";
import { useAuth } from "@/components/app/AppAuthProvider";
import { VendorView } from "@/components/app/views/VendorView";
import { useNakuruApp } from "@/components/app/AppProvider";
import { useMyVendorProfile } from "@/components/app/useMyVendorProfile";
import { accountMenuRowsSignedOut } from "@/lib/nakuru/vendor-profile";
import { usePwaInstall } from "@/components/app/pwa/InstallProvider";
import { consumePostSignInReturn } from "@/lib/nakuru/post-sign-in-tab";
import { useAssistantUi } from "@/components/app/assistant/AssistantUiProvider";
import { homeCopy } from "@/lib/nakuru/home-i18n";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

function InstallAccountRowSignedOut() {
  const { standalone, openInstallSheet, t } = usePwaInstall();
  if (standalone) return null;
  return (
    <div
      className="card li"
      role="button"
      tabIndex={0}
      onClick={() => openInstallSheet("account")}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") openInstallSheet("account");
      }}
    >
      <div className="av pwa-install-av" aria-hidden>
        <img src="/icons/icon-192.png" alt="" width={28} height={28} />
      </div>
      <div className="t" style={{ flex: 1 }}>
        {t("installRow")}
      </div>
      <span className="m">›</span>
    </div>
  );
}

export function AccountView() {
  const { state, dispatch, toast } = useNakuruApp();
  const { openAssistant } = useAssistantUi();
  const { user, ready, logout } = useAuth();
  const { profile: vendorProfile } = useMyVendorProfile();
  const { lang, setLang, standalone, openInstallSheet } = usePwaInstall();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    const { tab, path } = consumePostSignInReturn();
    if (path?.startsWith("/app/p/")) {
      router.push(path);
      return;
    }
    if (tab) dispatch({ type: "SET_TAB", tab });
    else if (path) router.push(path);
  }, [user, dispatch, router]);

  if (state.acc) {
    if (state.acc === "vendor" && ready && !user) {
      return (
        <>
          <button
            type="button"
            className="btn s o"
            onClick={() => dispatch({ type: "SET_ACC", acc: null })}
          >
            ‹ Back
          </button>
          <EmailOtpForm
            openSellingAfterSignIn
            showGuestBrowse={false}
          />
        </>
      );
    }

    return (
      <>
        <button
          type="button"
          className="btn s o"
          onClick={() => dispatch({ type: "SET_ACC", acc: null })}
        >
          ‹ Back
        </button>
        {state.acc === "vendor" ? (
          <VendorView />
        ) : (
          <p className="m">
            Staff tools are at <code>/staff</code> — not in the shopper app.
          </p>
        )}
      </>
    );
  }

  const signedIn = ready && user;

  if (!signedIn) {
    return (
      <>
        <EmailOtpForm />
        <div
          className="card li"
          role="button"
          tabIndex={0}
          onClick={() => openAssistant({ screen: "help", source: "account-signed-out" })}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              openAssistant({ screen: "help", source: "account-signed-out" });
            }
          }}
        >
          <div className="av">✦</div>
          <div className="t" style={{ flex: 1 }}>
            {homeCopy("assistantEntryAccount", lang)}
          </div>
          <span className="m">›</span>
        </div>
        <InstallAccountRowSignedOut />
        {accountMenuRowsSignedOut().map((r, i) => (
          <div
            key={`${r[2]}-${i}`}
            className="card li"
            role="button"
            tabIndex={0}
            onClick={() => dispatch({ type: "ACCOUNT_ROW", id: r[2] })}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                dispatch({ type: "ACCOUNT_ROW", id: r[2] });
              }
            }}
          >
            <div className="av">{r[0]}</div>
            <div className="t" style={{ flex: 1 }}>
              {r[1]}
            </div>
            <span className="m">›</span>
          </div>
        ))}
      </>
    );
  }

  return (
    <AccountSignedInView
      user={user}
      photo={state.photo}
      vendorProfile={vendorProfile}
      lang={lang}
      setLang={setLang}
      standalone={standalone}
      onInstallRow={() => openInstallSheet("account")}
      onDispatchRow={(id) => dispatch({ type: "ACCOUNT_ROW", id })}
      onSelectMode={(mode) => {
        if (mode === "selling") {
          dispatch({ type: "SLIDE_VENDOR" });
        }
      }}
      onSignOut={() => {
        void logout().then(() => toast(homeCopy("accSignedOut", lang)));
      }}
    />
  );
}
