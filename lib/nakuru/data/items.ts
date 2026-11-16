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
    p: 850,
    v: 1,
  },
  {
    id: 2,
    c: "shop",
    e: "smartphone",
    t: "Phone charger",
    s: "Rift Electro",
    p: 450,
    v: 0,
  },
  {
    id: 3,
    c: "shop",
    e: "salad",
    t: "Fresh veggies",
    s: "Gilani Fresh",
    p: 320,
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
    p: 1250000,
    v: 1,
  },
  {
    id: 9,
    c: "cars",
    e: "car",
    t: "Subaru Forester 2013",
    s: "92,000 km · Private seller",
    p: 1650000,
    v: 0,
  },
  {
    id: 10,
    c: "services",
    e: "bolt",
    t: "John, electrician",
    s: "Wiring and repairs · from",
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
    p: 700,
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