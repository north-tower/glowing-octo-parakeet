"use client";

import dynamic from "next/dynamic";
import { LandingLangProvider } from "@/components/landing/LandingLangContext";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { MobileCtaBar } from "@/components/landing/MobileCtaBar";
import { useMobileCtaBar } from "@/components/landing/hooks/useMobileCtaBar";
import { useRevealSections } from "@/components/landing/hooks/useRevealSections";
import { Bi } from "@/components/landing/Bi";
import { HeroSection } from "@/components/landing/sections/HeroSection";
import { ProofBandSection } from "@/components/landing/sections/ProofBandSection";

const LandingBelowFold = dynamic(
  () =>
    import("@/components/landing/LandingBelowFold").then(
      (m) => m.LandingBelowFold,
    ),
  { loading: () => null },
);

function LandingEffects() {
  useRevealSections();
  useMobileCtaBar();
  return null;
}

export function LandingPage() {
  return (
    <LandingLangProvider>
      <LandingEffects />
      <a className="skip-link" href="#main-content">
        <Bi en="Skip to content" sw="Ruka hadi maudhui" />
      </a>
      <div className="proto-banner" role="status">
        <Bi
          en="Prototype — demo data resets on reload."
          sw="Toleo la majaribio — data inajipanga upya ukipakia ukurasa."
        />
      </div>
      <LandingHeader />
      <main className="landing-main" id="main-content">
        <HeroSection />
        <ProofBandSection />
        <LandingBelowFold />
      </main>
      <LandingFooter />
      <MobileCtaBar />
    </LandingLangProvider>
  );
}