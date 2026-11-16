"use client";

import { AppHeader } from "@/components/app/AppHeader";
import { BottomNav } from "@/components/app/BottomNav";
import { MainView } from "@/components/app/MainView";

export default function NakuruAppShell() {
  return (
    <div className="app-shell">
      <AppHeader />
      <MainView />
      <BottomNav />
    </div>
  );
}