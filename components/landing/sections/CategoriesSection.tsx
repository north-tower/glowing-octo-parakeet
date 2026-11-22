"use client";

import Link from "next/link";
import { Bi } from "@/components/landing/Bi";

const CATS = [
  { href: "/app?cat=property", en: "Property", sw: "Mali" },
  { href: "/app?cat=cars", en: "Vehicles", sw: "Magari" },
  { href: "/app?cat=shop", en: "Shopping", sw: "Duka" },
  { href: "/app?cat=services", en: "Services", sw: "Huduma" },
  { href: "/app?tab=cat", en: "Jobs", sw: "Kazi" },
  { href: "/app", en: "Events", sw: "Matukio" },
] as const;

export function CategoriesSection() {
  return (
    <section id="categories" className="section-after-hero reveal-section browse-cats">
      <div className="wrap">
        <p className="browse-kicker">
          <Bi en="Explore Nakuru" sw="Gundua Nakuru" />
        </p>
        <h2 data-en="Browse by category" data-sw="Vinjari kwa kategoria">
          Browse by category
        </h2>
        <p
          className="section-intro mut"
          data-en="Whatever you are looking for, start here."
          data-sw="Cho chote unachotafuta, anzia hapa."
        >
          Whatever you are looking for, start here.
        </p>
        <ul className="browse-cat-row">
          {CATS.map((cat) => (
            <li key={cat.href + cat.en}>
              <Link href={cat.href} className="browse-cat-card">
                <Bi en={cat.en} sw={cat.sw} />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
