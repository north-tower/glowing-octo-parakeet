"use client";

import { AppHeader } from "@/components/app/AppHeader";
import { AppProvider } from "@/components/app/AppProvider";
import { BottomNav } from "@/components/app/BottomNav";
import { MainView } from "@/components/app/MainView";

export default function NakuruAppShell() {
  return (
    <AppProvider>
      <div className="app-shell">
        <AppHeader />
        <MainView />
        <BottomNav />
      </div>
    </AppProvider>
  );
}