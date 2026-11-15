"use client";

import { Suspense } from "react";
import LegacyAppMount from "@/components/app/LegacyAppMount";

export default function NakuruAppPage() {
  return (
    <Suspense fallback={null}>
      <LegacyAppMount />
    </Suspense>
  );
}