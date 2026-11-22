"use client";

import { Bi } from "@/components/landing/Bi";

export function ProofBandSection() {
  return (
    <div
      className="proof-band proof-band--classified"
      data-en-aria="Highlights"
      data-sw-aria="Muhtasari"
      aria-label="Highlights"
    >
      <div className="wrap proof-band-inner">
        <article className="proof-item">
          <p className="proof-stat">
            <Bi en="One local hub" sw="Kituo kimoja" />
          </p>
          <p className="proof-label">
            <Bi
              en="Everything happening around you"
              sw="Kila kinachotokea karibu nawe"
            />
          </p>
        </article>
        <article className="proof-item">
          <p className="proof-stat">
            <Bi en="Simple discovery" sw="Uvumbuzi rahisi" />
          </p>
          <p className="proof-label">
            <Bi en="Search and filter with ease" sw="Tafuta na chuja kwa urahisi" />
          </p>
        </article>
        <article className="proof-item">
          <p className="proof-stat">
            <Bi en="Community first" sw="Jamii kwanza" />
          </p>
          <p className="proof-label">
            <Bi
              en="Support local sellers and services"
              sw="Saidia wauzaji na huduma za nyumbani"
            />
          </p>
        </article>
      </div>
    </div>
  );
}
