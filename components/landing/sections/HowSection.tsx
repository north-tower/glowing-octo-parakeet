"use client";

import Link from "next/link";




export function HowSection() {
  return (
    <>
      <section id="how" className="section-how reveal-section">
          <div className="wrap">
            <p className="section-eyebrow"><span className="section-eyebrow-line" aria-hidden="true"></span><span data-en="04 How it works" data-sw="04 Jinsi inavyofanya">04 How it works</span></p>
            <h2 data-en="How to start" data-sw="Jinsi ya kuanza">How to start</h2>
            <p className="section-intro mut" data-en="Free to join. Add a photo, pick categories, submit for approval." data-sw="Jiunge bure. Ongeza picha, chagua kategoria, wasilisha kukaguliwa.">Free to join. Add a photo, pick categories, submit for approval.</p>
            <div className="stepper" role="list">
              <article className="stepper-step" role="listitem">
                <div className="stepper-card">
                  <span className="stepper-num" aria-hidden="true">1</span>
                  <h3 data-en="Sign up in the app" data-sw="Jisajili kwenye programu">Sign up in the app</h3>
                  <p className="mut" data-en="Business name, phone, profile photo, and categories." data-sw="Jina la biashara, simu, picha, na kategoria.">Business name, phone, profile photo, and categories.</p>
                </div>
              </article>
              <article className="stepper-step" role="listitem">
                <div className="stepper-card">
                  <span className="stepper-num" aria-hidden="true">2</span>
                  <h3 data-en="Get approved" data-sw="Pata idhini">Get approved</h3>
                  <p className="mut" data-en="We review each category you sell in." data-sw="Tunakagua kila kategoria unayouza.">We review each category you sell in.</p>
                </div>
              </article>
              <article className="stepper-step" role="listitem">
                <div className="stepper-card">
                  <span className="stepper-num" aria-hidden="true">3</span>
                  <h3 data-en="List and sell" data-sw="Orodhesha na uuze">List and sell</h3>
                  <p className="mut" data-en="Use your category dashboard; aim for Verified for M-Pesa." data-sw="Tumia dashibodi yako; lenga Verified kwa M-Pesa.">Use your category dashboard; aim for Verified for M-Pesa.</p>
                </div>
              </article>
            </div>
            <div className="how-cta">
              <Link className="btn" href="/app?start=vendor" data-en="Open vendor sign-up" data-sw="Fungua usajili wa muuzaji">Open vendor sign-up</Link>
            </div>
          </div>
        </section>
    </>
  );
}
