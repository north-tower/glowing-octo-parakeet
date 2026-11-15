"use client";

import Link from "next/link";




export function WhySection() {
  return (
    <>
      <section id="why" className="reveal-section">
          <div className="wrap split">
            <div>
              <p className="section-eyebrow"><span className="section-eyebrow-line" aria-hidden="true"></span><span data-en="02 Why sell" data-sw="02 Kwa nini uuze">02 Why sell</span></p>
              <h2 data-en="Why sell on NakuruHub?" data-sw="Kwa nini uuze kwenye NakuruHub?">Why sell on NakuruHub?</h2>
              <p className="section-intro mut" data-en="A super app shaped for Nakuru — not a copy-paste marketplace." data-sw="Programu moja iliyoundwa kwa Nakuru — si soko la nakala.">A super app shaped for Nakuru — not a copy-paste marketplace.</p>
              <div className="verify-compare" role="group" aria-labelledby="compare-heading">
                <h3 id="compare-heading" className="visually-hidden" data-en="Verified versus unverified selling" data-sw="Verified dhidi ya kuuza bila uthibitisho">Verified versus unverified selling</h3>
                <article className="verify-lane lane-unverified">
                  <h4 data-en="Unverified seller" data-sw="Muuzaji bila uthibitisho">Unverified seller</h4>
                  <ol className="lane-steps">
                    <li data-en="List and sell" data-sw="Orodhesha na uuze">List and sell</li>
                    <li data-en="Buyers pay cash on delivery" data-sw="Wanunuzi wanalipa fedha taslimu ukifika">Buyers pay cash on delivery</li>
                  </ol>
                </article>
                <div className="compare-bridge">
                  <svg className="compare-arrow" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path className="arrow-shaft" d="M4 12h16"/><path className="arrow-head" d="m14 7 5 5-5 5"/></svg>
                  <p className="compare-label" data-en="Get approved to unlock" data-sw="Pata idhini kufungua">Get approved to unlock</p>
                </div>
                <article className="verify-lane lane-verified">
                  <h4 className="lane-heading-verified"><span data-en="Verified seller" data-sw="Muuzaji aliyethibitishwa">Verified seller</span> <span className="verified-badge" data-en="Verified" data-sw="Verified">Verified</span></h4>
                  <ol className="lane-steps">
                    <li data-en="ID + shop checks" data-sw="Ukaguzi wa kitambulisho na duka">ID + shop checks</li>
                    <li data-en="Collect M-Pesa upfront before delivery" data-sw="Kusanya M-Pesa mapema kabla ya uwasilishaji">Collect M-Pesa upfront before delivery</li>
                  </ol>
                </article>
              </div>
              <article className="zones-slim">
                <h3 data-en="Nakuru delivery zones" data-sw="Maeneo ya uwasilishaji Nakuru">Nakuru delivery zones</h3>
                <p className="visually-hidden" data-en="Delivery areas we serve in Nakuru" data-sw="Maeneo ya uwasilishaji Nakuru">Delivery areas we serve in Nakuru</p>
                <div className="zone-chips" role="list">
                  <span role="listitem">CBD</span>
                  <span role="listitem">Milimani</span>
                  <span role="listitem">Section 58</span>
                  <span role="listitem">Lanet</span>
                  <span role="listitem" data-en="more" data-sw="zaidi">more</span>
                </div>
              </article>
            </div>
          </div>
        </section>
    </>
  );
}
