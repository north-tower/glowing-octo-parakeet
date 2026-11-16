"use client";

import { AppHeader } from "@/components/app/AppHeader";
import { BottomNav } from "@/components/app/BottomNav";
import { MainView } from "@/components/app/MainView";
import { homeCopy } from "@/lib/nakuru/home-i18n";
import { usePwaInstall } from "@/components/app/pwa/InstallProvider";

export default function NakuruAppShell() {
  const { lang } = usePwaInstall();

  return (
  <>
      <a className="skip-link" href="#v">
        {homeCopy("skipToContent", lang)}
      </a>
      <div className="app-shell">
        <AppHeader />
        <MainView />
        <BottomNav />
      </div>
    </>
  );
}