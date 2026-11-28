"use client";

import { useRevealSections } from "@/components/landing/hooks/useRevealSections";
import { CategoriesSection } from "@/components/landing/sections/CategoriesSection";
import { CtaBandSection } from "@/components/landing/sections/CtaBandSection";
import { DashboardSection } from "@/components/landing/sections/DashboardSection";
import { FaqSection } from "@/components/landing/sections/FaqSection";
import { HowSection } from "@/components/landing/sections/HowSection";
import { PosBandSection } from "@/components/landing/sections/PosBandSection";
import { WhySection } from "@/components/landing/sections/WhySection";

/** Below-fold landing sections — split for route-level code splitting. */
export function LandingBelowFold() {
  useRevealSections();

  return (
    <>
      <CategoriesSection />
      <WhySection />
      <DashboardSection />
      <HowSection />
      <PosBandSection />
      <FaqSection />
      <CtaBandSection />
    </>
  );
}