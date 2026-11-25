import {
  IconBed,
  IconCar,
  IconClock,
  IconGrid,
  IconHome,
  IconMapPin,
  IconShieldCheck,
  IconTarget,
} from "@/components/app/icons/LineIcons";
import { homeCopy } from "@/lib/nakuru/home-i18n";
import type { LandingLang } from "@/lib/nakuru/i18n";
import type { ListingFactIcon, ListingKeyFact } from "@/lib/nakuru/listing-detail";
import type { ComponentType } from "react";

const ICONS: Record<ListingFactIcon, ComponentType<{ size?: number }>> = {
  location: IconMapPin,
  posted: IconClock,
  category: IconGrid,
  condition: IconShieldCheck,
  hours: IconClock,
  area: IconTarget,
  beds: IconBed,
  baths: IconHome,
  size: IconHome,
  year: IconClock,
  mileage: IconCar,
  gear: IconCar,
  default: IconGrid,
};

type Props = {
  lang: LandingLang;
  facts: ListingKeyFact[];
};

export function KeyFacts({ lang, facts }: Props) {
  if (!facts.length) return null;
  return (
    <section className="card pd-card pd-facts" aria-labelledby="pd-facts-h">
      <h2 id="pd-facts-h" className="pd-about-title">
        {homeCopy("productDetails", lang)}
      </h2>
      <ul className="pd-fact-list">
        {facts.map((row) => {
          const Icon = ICONS[row.icon] ?? ICONS.default;
          return (
            <li key={row.key} className="pd-fact">
              <Icon size={18} />
              <div>
                <span className="pd-fact-label">{row.label}</span>
                <span className="pd-fact-value">{row.value}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
