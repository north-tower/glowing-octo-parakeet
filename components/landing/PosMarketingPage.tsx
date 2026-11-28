"use client";

import Link from "next/link";
import { LandingLangProvider } from "@/components/landing/LandingLangContext";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { Bi } from "@/components/landing/Bi";
import { TryTillLink } from "@/components/landing/TryTillLink";
import { useRevealSections } from "@/components/landing/hooks/useRevealSections";

function Reveal() {
  useRevealSections();
  return null;
}

export function PosMarketingPage() {
  return (
    <LandingLangProvider>
      <Reveal />
      <a className="skip-link" href="#main-content">
        <Bi en="Skip to content" sw="Ruka hadi maudhui" />
      </a>
      <LandingHeader />
      <main className="landing-main" id="main-content">
        <section className="hero hero--classified">
          <div className="wrap hero-grid">
            <div className="hero-copy">
              <span className="hero-kicker">
                <Bi en="NakuruHub POS" sw="NakuruHub POS" />
              </span>
              <h1>
                <Bi
                  en="The till for shops on NakuruHub"
                  sw="Kaunta ya maduka kwenye NakuruHub"
                />
              </h1>
              <p className="lead">
                <Bi
                  en="Sales, customer credit, and today’s numbers — built for the counter, not the marketplace feed."
                  sw="Mauzo, deni la wateja, na hesabu ya leo — kwa kaunta, si kwa soko."
                />
              </p>
              <div className="hero-cta">
                <TryTillLink className="btn fl" />
                <Link className="btn ghost hero-btn-outline" href="/app?start=vendor">
                  <Bi en="Post a listing" sw="Weka tangazo" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="section-how reveal-section">
          <div className="wrap">
            <div className="stepper" role="list">
              <article className="stepper-step" role="listitem">
                <div className="stepper-card">
                  <span className="stepper-num" aria-hidden="true">
                    1
                  </span>
                  <h3>
                    <Bi en="Take payment" sw="Pokea malipo" />
                  </h3>
                  <p className="mut">
                    <Bi
                      en="Ring up the sale at the counter."
                      sw="Rekodi mauzo kwenye kaunta."
                    />
                  </p>
                </div>
              </article>
              <article className="stepper-step" role="listitem">
                <div className="stepper-card">
                  <span className="stepper-num" aria-hidden="true">
                    2
                  </span>
                  <h3>
                    <Bi en="Track credit" sw="Fuatilia deni" />
                  </h3>
                  <p className="mut">
                    <Bi
                      en="Who owes the shop, and what they paid."
                      sw="Nani ana deni, na alicholipa."
                    />
                  </p>
                </div>
              </article>
              <article className="stepper-step" role="listitem">
                <div className="stepper-card">
                  <span className="stepper-num" aria-hidden="true">
                    3
                  </span>
                  <h3>
                    <Bi en="See the day" sw="Angalia siku" />
                  </h3>
                  <p className="mut">
                    <Bi
                      en="Today’s totals without leaving the till."
                      sw="Jumla ya leo bila kuacha kaunta."
                    />
                  </p>
                </div>
              </article>
            </div>
            <p className="section-intro mut">
              <Bi
                en="The demo is view-only. A real shop gets its own store later."
                sw="Demo ni kuangalia tu. Duka halisi litapata akaunti yake baadaye."
              />
            </p>
            <div className="how-cta cta-actions">
              <TryTillLink className="btn fl" />
              <Link className="btn" href="/app?start=vendor">
                <Bi en="Post a listing" sw="Weka tangazo" />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <LandingFooter />
    </LandingLangProvider>
  );
}
