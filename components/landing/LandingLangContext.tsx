"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  applyLang,
  readStoredLang,
  storeLang,
  type LandingLang,
} from "@/lib/nakuru/i18n";

type LandingLangContextValue = {
  lang: LandingLang;
  setLang: (lang: LandingLang) => void;
  t: (en: string, sw: string) => string;
};

const LandingLangContext = createContext<LandingLangContextValue | null>(null);

export function LandingLangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LandingLang>("en");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const initial = readStoredLang();
    setLangState(initial);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    applyLang(lang);
  }, [lang, ready]);

  const setLang = useCallback((next: LandingLang) => {
    storeLang(next);
    setLangState(next);
  }, []);

  const t = useCallback(
    (en: string, sw: string) => (lang === "sw" ? sw : en),
    [lang],
  );

  const value = useMemo(
    () => ({ lang, setLang, t }),
    [lang, setLang, t],
  );

  return (
    <LandingLangContext.Provider value={value}>
      {children}
    </LandingLangContext.Provider>
  );
}

export function useLandingLang(): LandingLangContextValue {
  const ctx = useContext(LandingLangContext);
  if (!ctx) {
    throw new Error("useLandingLang must be used within LandingLangProvider");
  }
  return ctx;
}