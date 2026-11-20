"use client";

import Link from "next/link";




export function CtaBandSection() {
  return (
    <>
      <section className="cta-band reveal-section" id="cta-final">
          <span className="cta-flamingo" aria-hidden="true">
            <img src="/icons/icon-192.png" width={96} height={96} alt="" />
          </span>
          <div className="wrap cta-inner">
            <h2 data-en="Ready to grow in Nakuru?" data-sw="Uko tayari kukuza biashara Nakuru?">Ready to grow in Nakuru?</h2>
            <p className="cta-sub" data-en="One marketplace for Nakuru County — built for local trust." data-sw="Soko moja kwa Kaunti ya Nakuru — imejengwa kwa uaminifu wa ndani.">One marketplace for Nakuru County — built for local trust.</p>
            <div className="cta-actions">
              <Link className="btn fl" href="/app?start=vendor" data-en="Start selling now" data-sw="Anza kuuza sasa">Start selling now</Link>
              <Link className="btn ghost cta-browse" href="/app" data-en="Browse app" data-sw="Tazama programu">Browse app</Link>
            </div>
          </div>
        </section>
    </>
  );
}
