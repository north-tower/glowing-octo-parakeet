"use client";

import Link from "next/link";
import { Bi } from "@/components/landing/Bi";
import { TryTillLink } from "@/components/landing/TryTillLink";

export function PosBandSection() {
  return (
    <section id="pos" className="reveal-section">
      <div className="wrap">
        <p className="section-eyebrow">
          <span className="section-eyebrow-line" aria-hidden="true" />
          <Bi en="For shops" sw="Kwa maduka" />
        </p>
        <h2>
          <Bi en="NakuruHub POS" sw="NakuruHub POS" />
        </h2>
        <p className="section-intro mut">
          <Bi
            en="Till for shops that sell on NakuruHub — sales, credit, and today’s numbers at the counter."
            sw="Kaunta kwa maduka yanayouza kwenye NakuruHub — mauzo, deni, na hesabu ya leo."
          />
        </p>
        <div className="cta-actions">
          <Link className="btn fl" href="/pos">
            <Bi en="See NakuruHub POS" sw="Tazama NakuruHub POS" />
          </Link>
          <TryTillLink className="btn ghost" />
        </div>
      </div>
    </section>
  );
}
