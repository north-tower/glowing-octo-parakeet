"use client";

import { AppHeader } from "@/components/app/AppHeader";
import { AppProvider } from "@/components/app/AppProvider";
import { BottomNav } from "@/components/app/BottomNav";
import { Fab } from "@/components/app/Fab";
import { MainView } from "@/components/app/MainView";
import { SignInBar } from "@/components/app/SignInBar";

export default function NakuruAppShell() {
  return (
    <AppProvider>
      <div className="app-shell">
        <AppHeader />
        <MainView />
        <SignInBar />
        <Fab />
        <BottomNav />
      </div>
    </AppProvider>
  );
}