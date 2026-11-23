"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useOptionalNakuruApp } from "@/components/app/AppProvider";
import {
  LANDING_LANG_KEY,
  applyLang,
  readStoredLang,
  storeLang,
  type LandingLang,
} from "@/lib/nakuru/i18n";
import { installCopy } from "@/lib/nakuru/pwa-install-i18n";
import {
  canShowInstallCard,
  clearRetriggerAfterShow,
  detectInstallPlatform,
  dispatchInstallEvent,
  isStandaloneDisplay,
  markInstalled,
  markInstallDismissed,
  markPromptDismissed,
  readInstalled,
  recordAppVisit,
  recordCartEngagement,
  type InstallPlatform,
} from "@/lib/nakuru/pwa-engage";
import { InstallSheet } from "@/components/app/pwa/InstallSheet";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type InstallContextValue = {
  lang: LandingLang;
  setLang: (lang: LandingLang) => void;
  t: (key: Parameters<typeof installCopy>[0]) => string;
  platform: InstallPlatform;
  standalone: boolean;
  homeCardVisible: boolean;
  dismissHomeCard: () => void;
  openInstallSheet: (source: "card" | "account" | "retrigger") => void;
  offline: boolean;
};

const InstallContext = createContext<InstallContextValue | null>(null);

export function usePwaInstall(): InstallContextValue {
  const ctx = useContext(InstallContext);
  if (!ctx) {
    throw new Error("usePwaInstall must be used within InstallProvider");
  }
  return ctx;
}

function registerServiceWorker(): void {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
  });
}

const noopToast = () => undefined;

export function InstallProvider({ children }: { children: ReactNode }) {
  const nakuru = useOptionalNakuruApp();
  const toast = nakuru?.toast ?? noopToast;
  const cart = nakuru?.state.cart;
  const tab = nakuru?.state.tab;
  const [lang, setLang] = useState<LandingLang>("en");
  const [standalone, setStandalone] = useState(false);
  const [platform, setPlatform] = useState<InstallPlatform>("generic");
  const [homeCardVisible, setHomeCardVisible] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [offline, setOffline] = useState(false);
  const [hasNativePrompt, setHasNativePrompt] = useState(false);
  const deferredRef = useRef<BeforeInstallPromptEvent | null>(null);

  const refreshCard = useCallback(() => {
    if (isStandaloneDisplay() || readInstalled()) {
      setHomeCardVisible(false);
      return;
    }
    const nativeReady = deferredRef.current != null;
    setHomeCardVisible(canShowInstallCard() && nativeReady);
  }, []);

  const setLangChoice = useCallback((next: LandingLang) => {
    storeLang(next);
    setLang(next);
    applyLang(next);
  }, []);

  const t = useCallback(
    (key: Parameters<typeof installCopy>[0]) => installCopy(key, lang),
    [lang],
  );

  useEffect(() => {
    registerServiceWorker();
    setLang(readStoredLang());
    setStandalone(isStandaloneDisplay() || readInstalled());
    setPlatform(detectInstallPlatform());
    recordAppVisit();
    refreshCard();

    const onStorage = (e: StorageEvent) => {
      if (e.key === LANDING_LANG_KEY) setLang(readStoredLang());
    };
    window.addEventListener("storage", onStorage);

    const onBip = (e: Event) => {
      e.preventDefault();
      deferredRef.current = e as BeforeInstallPromptEvent;
      setHasNativePrompt(true);
      refreshCard();
    };
    window.addEventListener("beforeinstallprompt", onBip);

    const onInstalled = () => {
      markInstalled();
      deferredRef.current = null;
      setHasNativePrompt(false);
      setStandalone(true);
      setHomeCardVisible(false);
      setSheetOpen(false);
      toast(installCopy("installedToast", readStoredLang()));
      dispatchInstallEvent("nh:install-accepted");
    };
    window.addEventListener("appinstalled", onInstalled);

    const onEngage = () => refreshCard();
    window.addEventListener("nh:engage", onEngage);

    const onOnline = () => setOffline(false);
    const onOffline = () => setOffline(true);
    setOffline(!navigator.onLine);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("beforeinstallprompt", onBip);
      window.removeEventListener("appinstalled", onInstalled);
      window.removeEventListener("nh:engage", onEngage);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [refreshCard, toast]);

  useEffect(() => {
    if (standalone || !cart) return;
    if (Object.keys(cart).length > 0) recordCartEngagement();
  }, [cart, standalone]);

  useEffect(() => {
    if (tab == null) return;
    refreshCard();
  }, [tab, refreshCard]);

  const dismissHomeCard = useCallback(() => {
    markInstallDismissed();
    setHomeCardVisible(false);
    dispatchInstallEvent("nh:install-dismissed", { surface: "card" });
  }, []);

  const runNativePrompt = useCallback(async () => {
    const ev = deferredRef.current;
    if (!ev) return false;
    try {
      await ev.prompt();
      const { outcome } = await ev.userChoice;
      deferredRef.current = null;
      setHasNativePrompt(false);
      if (outcome === "accepted") {
        markInstalled();
        toast(installCopy("installedToast", readStoredLang()));
        dispatchInstallEvent("nh:install-accepted", { via: "native" });
        setSheetOpen(false);
        return true;
      }
      markPromptDismissed();
      refreshCard();
      dispatchInstallEvent("nh:install-dismissed", { via: "native" });
      return false;
    } catch {
      refreshCard();
      return false;
    }
  }, [refreshCard, toast]);

  const openInstallSheet = useCallback(
    async (source: "card" | "account" | "retrigger") => {
      if (standalone) return;
      dispatchInstallEvent("nh:install-clicked", { source });
      if (source === "card" && homeCardVisible) clearRetriggerAfterShow();
      if (deferredRef.current) {
        const accepted = await runNativePrompt();
        if (accepted) return;
      }
      setSheetOpen(true);
    },
    [homeCardVisible, runNativePrompt, standalone],
  );

  useEffect(() => {
    if (!homeCardVisible || standalone) return;
    clearRetriggerAfterShow();
    dispatchInstallEvent("nh:install-shown", { surface: "card" });
  }, [homeCardVisible, standalone]);

  const value = useMemo<InstallContextValue>(
    () => ({
      lang,
      setLang: setLangChoice,
      t,
      platform,
      standalone,
      homeCardVisible,
      dismissHomeCard,
      openInstallSheet,
      offline,
    }),
    [
      lang,
      setLangChoice,
      t,
      platform,
      standalone,
      homeCardVisible,
      dismissHomeCard,
      openInstallSheet,
      offline,
    ],
  );

  return (
    <InstallContext.Provider value={value}>
      {children}
      {offline ? (
        <div className="pwa-offline" role="status" aria-live="polite">
          {t("offlineBanner")}
        </div>
      ) : null}
      <InstallSheet
        open={sheetOpen}
        platform={platform}
        onClose={() => setSheetOpen(false)}
        onNativeInstall={runNativePrompt}
        hasNativePrompt={hasNativePrompt}
        t={t}
        toast={toast}
      />
    </InstallContext.Provider>
  );
}