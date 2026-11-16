import {
  getLiveListingById,
  isLiveCatalogEnabled,
} from "@/lib/nakuru/catalog-live";
import type { Listing } from "@/lib/nakuru/types";

export const ITEMS: Listing[] = [
  {
    id: 1,
    c: "shop",
    e: "shirt",
    t: "Mtumba jacket",
    s: "Mama Fashions",
    vn: "Mama Fashions",
    p: 850,
    v: 1,
  },
  {
    id: 2,
    c: "shop",
    e: "smartphone",
    t: "Phone charger",
    s: "Rift Electro",
    vn: "Rift Electro",
    desc:
      "Dual USB wall adapter with 1.2 m braided cable, fits Type-C and Micro-USB phones. Tested in-shop before dispatch. Nakuru CBD same-day drop-off when you order before 4 p.m.",
    imgs: [
      "https://images.unsplash.com/photo-1583863788434-e58a363049cf?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1591290618608-c70f23c9d94f?w=900&auto=format&fit=crop&q=80",
    ],
    img: "https://images.unsplash.com/photo-1583863788434-e58a363049cf?w=900&auto=format&fit=crop&q=80",
    p: 450,
    v: 0,
  },
  {
    id: 3,
    c: "shop",
    e: "salad",
    t: "Fresh veggies",
    s: "Gilani Fresh",
    p: 120,
    v: 1,
  },
  {
    id: 4,
    c: "shop",
    e: "shoe",
    t: "Running sneakers",
    s: "Kicks254",
    p: 3200,
    v: 0,
  },
  {
    id: 13,
    c: "shop",
    e: "tv",
    t: "Smart TV 32 inch",
    s: "Rift Electro",
    p: 11599,
    v: 0,
  },
  {
    id: 14,
    c: "shop",
    e: "cooking-pot",
    t: "Kitchen cookware set",
    s: "Gilani Home",
    p: 4200,
    v: 1,
  },
  {
    id: 15,
    c: "shop",
    e: "watch",
    t: "Men's steel watch",
    s: "Time Hub",
    p: 2800,
    v: 0,
  },
  {
    id: 5,
    c: "property",
    e: "home",
    t: "2 bedroom, Milimani",
    s: "Rent per month · Zawadi Agents",
    vn: "Zawadi Agents",
    desc: "Ground-floor unit with parking, water backup, and 24h guard. Viewing on Saturdays.",
    attrs: { bedrooms: "2", area: "Milimani" },
    p: 35000,
    v: 1,
  },
  {
    id: 6,
    c: "property",
    e: "home-sale",
    t: "Bedsitter, Section 58",
    s: "Rent per month · Kamau Homes",
    p: 8000,
    v: 0,
  },
  {
    id: 7,
    c: "property",
    e: "mountain",
    t: "¼ acre plot, Lanet",
    s: "For sale · Rift Land Ltd",
    p: 2800000,
    v: 1,
  },
  {
    id: 8,
    c: "cars",
    e: "car",
    t: "Toyota Axio 2015",
    s: "68,000 km · Nakuru Motors",
    vn: "Nakuru Motors",
    desc: "Well serviced, new tyres, accident-free logbook ready for transfer.",
    attrs: { mileage: "68,000 km", year: "2015" },
    p: 1250000,
    v: 1,
  },
  {
    id: 9,
    c: "cars",
    e: "car",
    t: "Subaru Forester 2013",
    s: "92,000 km · Private seller",
    vn: "Private seller",
    attrs: { mileage: "92,000 km", year: "2013" },
    p: 1650000,
    v: 0,
  },
  {
    id: 10,
    c: "services",
    e: "bolt",
    t: "John, electrician",
    s: "Wiring and repairs · from",
    vn: "John",
    desc: "Certified electrician for homes and small shops. Same-day callouts in Nakuru CBD.",
    p: 800,
    v: 1,
  },
  {
    id: 11,
    c: "services",
    e: "sparkles",
    t: "Wanjiru Cleaners",
    s: "Home and office · from",
    p: 1500,
    v: 0,
  },
  {
    id: 12,
    c: "services",
    e: "wrench",
    t: "Peter, plumber",
    s: "Leaks and fittings · from",
    vn: "Peter",
    p: 700,
    v: 1,
  },
  {
    id: 16,
    c: "shop",
    e: "shirt",
    t: "Kitenge two-piece — QA showcase",
    s: "Mama Fashions",
    vn: "Mama Fashions",
    desc: "Bright cotton kitenge set sized M–L. Freshly steamed, Nakuru CBD pickup or delivery. Ideal for church, weddings, or office Fridays.",
    imgs: [
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1583496661161-f2a7ab7da53c?w=900&auto=format&fit=crop&q=80",
    ],
    img: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=900&auto=format&fit=crop&q=80",
    attrs: { year: "2024", area: "M–L" },
    p: 3000,
    v: 1,
  },
];

export function itemById(id: number | string): Listing | undefined {
  if (isLiveCatalogEnabled()) {
    return getLiveListingById(String(id));
  }
  const n = typeof id === "string" ? Number(id) : id;
  if (Number.isNaN(n)) return undefined;
  return ITEMS.find((x) => x.id === n);
}

export function demoItems(): Listing[] {
  if (isLiveCatalogEnabled()) return [];
  return ITEMS;
}