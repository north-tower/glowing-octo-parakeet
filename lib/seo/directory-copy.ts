import type { ListingMode } from "@/lib/nakuru/types";

export type SeoCategory = {
  slug: string;
  label: string;
  listingMode: ListingMode;
};

type Copy = { heading: (place: string) => string; intro: (place: string) => string };

const OFFICIAL_COPY: Record<string, Copy> = {
  vehicles: {
    heading: (p) => `Vehicles for sale in ${p}`,
    intro: (p) =>
      `Cars, motorcycles, buses and vehicle parts from sellers in ${p} on NakuruHub.`,
  },
  "real-estate": {
    heading: (p) => `Houses, land & property in ${p}`,
    intro: (p) =>
      `Houses and apartments for rent or sale, plots and land in ${p}. Contact owners and agents directly.`,
  },
  "business-and-industry": {
    heading: (p) => `Shops & products in ${p}`,
    intro: (p) =>
      `Buy from local shops in ${p} — electronics, fashion, home goods and more from vendors near you.`,
  },
  shop: {
    heading: (p) => `Shops & products in ${p}`,
    intro: (p) =>
      `Buy from local shops in ${p} — electronics, fashion, home goods and more, with delivery or pickup from vendors near you.`,
  },
  property: {
    heading: (p) => `Houses, land & property in ${p}`,
    intro: (p) =>
      `Houses and apartments for rent, plots and land for sale in ${p}. Contact owners and agents directly and book a viewing.`,
  },
  cars: {
    heading: (p) => `Cars for sale in ${p}`,
    intro: (p) =>
      `Used and new cars for sale in ${p}. Compare prices, see photos and arrange a viewing with the seller.`,
  },
  services: {
    heading: (p) => `Local services in ${p}`,
    intro: (p) =>
      `Find plumbers, electricians, salons, cleaners and other trusted service providers in ${p}, and request a quote.`,
  },
  stays: {
    heading: (p) => `Stays & accommodation in ${p}`,
    intro: (p) => `Short stays and accommodation in ${p}.`,
  },
  taxi: {
    heading: (p) => `Taxis & rides in ${p}`,
    intro: (p) => `Taxis and local rides in ${p}.`,
  },
  rider: {
    heading: (p) => `Delivery & ride riders in ${p}`,
    intro: (p) =>
      `Find delivery riders, couriers and boda operators in ${p} and request a quote.`,
  },
};

export function categoryHeading(cat: SeoCategory, place: string): string {
  return OFFICIAL_COPY[cat.slug]?.heading(place) ?? `${cat.label} in ${place}`;
}

export function categoryIntro(cat: SeoCategory, place: string): string {
  return (
    OFFICIAL_COPY[cat.slug]?.intro(place) ??
    `Browse ${cat.label.toLowerCase()} listings from local vendors in ${place} on NakuruHub.`
  );
}

export function placeName(areaName?: string): string {
  return areaName ? `${areaName}, Nakuru` : "Nakuru";
}
