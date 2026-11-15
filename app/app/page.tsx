"use client";

import { Suspense } from "react";
import NakuruAppShell from "@/components/app/NakuruAppShell";

export default function NakuruAppPage() {
  return (
    <Suspense fallback={null}>
      <NakuruAppShell />
    </Suspense>
  );
}