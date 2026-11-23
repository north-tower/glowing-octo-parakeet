"use client";

import { Suspense } from "react";
import { AppShellLoading } from "@/components/app/loading/LoadingUi";
import NakuruAppShell from "@/components/app/NakuruAppShell";

export default function NakuruAppPage() {
  return (
    <Suspense fallback={<AppShellLoading />}>
      <NakuruAppShell />
    </Suspense>
  );
}