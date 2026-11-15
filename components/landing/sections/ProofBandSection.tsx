"use client";

import { Bi } from "@/components/landing/Bi";

export function ProofBandSection() {
  return (
    <div
      className="proof-band"
      data-en-aria="Highlights"
      data-sw-aria="Muhtasari"
      aria-label="Highlights"
    >
      <div className="wrap proof-band-inner">
        <article className="proof-item">
          <p className="proof-stat" aria-hidden="true">
            KES&nbsp;0
          </p>
          <p className="proof-label">
            <Bi en="to join and list" sw="kujiunga na kuorodhesha" />
          </p>
        </article>
        <article className="proof-item">
          <p className="proof-stat" aria-hidden="true">
            4&nbsp;live
          </p>
          <p className="proof-label">
            <Bi en="categories, 2 coming soon" sw="kategoria, 2 zinakuja" />
          </p>
        </article>
        <article className="proof-item">
          <p className="proof-stat" aria-hidden="true">
            M-Pesa
          </p>
          <p className="proof-label">
            <Bi
              en="upfront for Verified vendors"
              sw="mapema kwa wauzaji Verified"
            />
          </p>
        </article>
      </div>
    </div>
  );
}