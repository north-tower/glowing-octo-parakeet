import type { ListingMode } from "@/lib/nakuru/types";

export type DirectoryKind = "official" | "community";

export type DirectoryCategory = {
  slug: string;
  label: string;
  kind: DirectoryKind;
  listingMode: ListingMode;
  visible: boolean;
  openForApply: boolean;
  sortOrder: number;
};

export const OFFICIAL_DIRECTORY_FALLBACK: DirectoryCategory[] = [
  { slug: "shop", label: "Shop", kind: "official", listingMode: "shop", visible: true, openForApply: true, sortOrder: 10 },
  { slug: "services", label: "Services", kind: "official", listingMode: "services", visible: true, openForApply: true, sortOrder: 20 },
  { slug: "property", label: "Property", kind: "official", listingMode: "property", visible: true, openForApply: true, sortOrder: 30 },
  { slug: "cars", label: "Cars", kind: "official", listingMode: "cars", visible: true, openForApply: true, sortOrder: 40 },
  { slug: "stays", label: "Stays", kind: "official", listingMode: "shop", visible: true, openForApply: true, sortOrder: 50 },
  { slug: "taxi", label: "Taxi", kind: "official", listingMode: "services", visible: true, openForApply: true, sortOrder: 60 },
  { slug: "rider", label: "Rider", kind: "official", listingMode: "services", visible: true, openForApply: true, sortOrder: 65 },
];