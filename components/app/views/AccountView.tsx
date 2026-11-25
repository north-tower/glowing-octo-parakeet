"use client";

import { SignInForm, type SignInIntent } from "@/components/app/auth/SignInForm";
import { AccountSignedInView } from "@/components/app/account/AccountSignedInView";
import { AccountGuestPanel } from "@/components/app/account/AccountGuestPanel";
import { useAuth } from "@/components/app/AppAuthProvider";
import { VendorView } from "@/components/app/views/VendorView";
import { useNakuruApp } from "@/components/app/AppProvider";
import { useMyVendorProfile } from "@/components/app/useMyVendorProfile";
import { usePwaInstall } from "@/components/app/pwa/InstallProvider";
import { consumePostSignInReturn, requestPostSignInReturn } from "@/lib/nakuru/post-sign-in-tab";
import { homeCopy } from "@/lib/nakuru/home-i18n";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function AccountView() {
  const { state, dispatch, toast } = useNakuruApp();
  const { user, ready, logout } = useAuth();
  const { profile: vendorProfile } = useMyVendorProfile();
  const { lang, setLang, standalone, openInstallSheet } = usePwaInstall();
  const router = useRouter();
  const [intent, setIntent] = useState<SignInIntent>(null);

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
        <SignInForm
          openSellingAfterSignIn
          showGuestBrowse={false}
          showBack
          onBack={() => dispatch({ type: "SET_ACC", acc: null })}
        />
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
      <div className="account-signed-out">
        <SignInForm showGuestBrowse={false} intent={intent} />
        <AccountGuestPanel
          onNeedSignIn={(next) => {
            setIntent(next);
            if (next === "orders") requestPostSignInReturn({ tab: "cart" });
            else requestPostSignInReturn({ tab: "acc" });
            document.getElementById("signin-email")?.focus();
          }}
          onSell={() => dispatch({ type: "ACCOUNT_ROW", id: "acc:vendor" })}
        />
      </div>
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
