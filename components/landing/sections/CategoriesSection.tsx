"use client";

import Link from "next/link";
import { Bi } from "@/components/landing/Bi";
import {
  IconBolt,
  IconCar,
  IconHome,
  IconShoppingBag,
  IconSparkle,
  IconTools,
} from "@/components/app/icons/LineIcons";

const CATS = [
  { href: "/app?cat=real-estate", en: "Property", sw: "Mali", Icon: IconHome },
  { href: "/app?cat=vehicles", en: "Vehicles", sw: "Magari", Icon: IconCar },
  {
    href: "/app?cat=business-and-industry",
    en: "Shopping",
    sw: "Duka",
    Icon: IconShoppingBag,
  },
  { href: "/app?cat=services", en: "Services", sw: "Huduma", Icon: IconTools },
  { href: "/app?tab=cat&side=jobs", en: "Jobs", sw: "Kazi", Icon: IconBolt },
  { href: "/app", en: "Events", sw: "Matukio", Icon: IconSparkle },
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
          {CATS.map((cat) => {
            const Icon = cat.Icon;
            return (
              <li key={cat.href + cat.en}>
                <Link href={cat.href} className="browse-cat-card">
                  <span className="browse-cat-icon" aria-hidden>
                    <Icon size={28} />
                  </span>
                  <Bi en={cat.en} sw={cat.sw} />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
