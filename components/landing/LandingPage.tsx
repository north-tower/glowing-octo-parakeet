"use client";

import { LandingLangProvider } from "@/components/landing/LandingLangContext";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { MobileCtaBar } from "@/components/landing/MobileCtaBar";
import { useMobileCtaBar } from "@/components/landing/hooks/useMobileCtaBar";
import { useRevealSections } from "@/components/landing/hooks/useRevealSections";
import { Bi } from "@/components/landing/Bi";
import { CategoriesSection } from "@/components/landing/sections/CategoriesSection";
import { CtaBandSection } from "@/components/landing/sections/CtaBandSection";
import { DashboardSection } from "@/components/landing/sections/DashboardSection";
import { FaqSection } from "@/components/landing/sections/FaqSection";
import { HeroSection } from "@/components/landing/sections/HeroSection";
import { HowSection } from "@/components/landing/sections/HowSection";
import { ProofBandSection } from "@/components/landing/sections/ProofBandSection";
import { WhySection } from "@/components/landing/sections/WhySection";

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
        <CategoriesSection />
        <WhySection />
        <DashboardSection />
        <HowSection />
        <FaqSection />
        <CtaBandSection />
      </main>
      <LandingFooter />
      <MobileCtaBar />
    </LandingLangProvider>
  );
}