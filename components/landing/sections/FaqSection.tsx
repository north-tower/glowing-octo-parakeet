"use client";

import Link from "next/link";




export function FaqSection() {
  return (
    <>
      <section id="faq" className="section-faq reveal-section">
          <div className="wrap">
            <p className="section-eyebrow"><span className="section-eyebrow-line" aria-hidden="true"></span><span data-en="05 FAQ" data-sw="05 Maswali">05 FAQ</span></p>
            <h2 data-en="Common questions" data-sw="Maswali ya kawaida">Common questions</h2>
            <div className="faq">
              <details className="faq-item" open>
                <summary data-en="Is it really free to list?" data-sw="Je, kuorodhesha ni bure kweli?">Is it really free to list?</summary>
                <p className="mut" data-en="Yes. Joining and listing on NakuruHub are free." data-sw="Ndiyo. Kujiunga na kuorodhesha kwenye NakuruHub ni bure.">Yes. Joining and listing on NakuruHub are free.</p>
              </details>
              <details className="faq-item">
                <summary data-en="What does Verified mean?" data-sw="Verified inamaanisha nini?">What does Verified mean?</summary>
                <p className="mut" data-en="Verified vendors pass ID and category checks and can accept M-Pesa upfront on orders. Unverified vendors use cash on delivery only." data-sw="Wauzaji Verified hupita ukaguzi wa kitambulisho na kategoria na wanaweza kukubali M-Pesa mapema. Wasio Verified wanatumia fedha taslimu ukifika tu.">Verified vendors pass ID and category checks and can accept M-Pesa upfront on orders. Unverified vendors use cash on delivery only.</p>
              </details>
              <details className="faq-item">
                <summary data-en="Do you deliver outside Nakuru?" data-sw="Mnafikisha nje ya Nakuru?">Do you deliver outside Nakuru?</summary>
                <p className="mut" data-en="Not yet. NakuruHub serves Nakuru County first. Join the waitlist in the app if you’re outside." data-sw="Bado. NakuruHub inahudumia Kaunti ya Nakuru kwanza. Jiunge na orodha ya kusubiri kwenye programu ikiwa uko nje.">Not yet. NakuruHub serves Nakuru County first. Join the waitlist in the app if you’re outside.</p>
              </details>
            </div>
          </div>
        </section>
    </>
  );
}
