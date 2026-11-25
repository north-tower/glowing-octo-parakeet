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
  parentSlug: string | null;
  depth: number;
  hasChildren: boolean;
};

export const OFFICIAL_DIRECTORY_FALLBACK: DirectoryCategory[] = [
  { slug: "vehicles", label: "Vehicles", kind: "official", listingMode: "cars", visible: true, openForApply: true, sortOrder: 10, parentSlug: null, depth: 0, hasChildren: true },
  { slug: "real-estate", label: "Real Estate", kind: "official", listingMode: "property", visible: true, openForApply: true, sortOrder: 20, parentSlug: null, depth: 0, hasChildren: true },
  { slug: "mobile-phones-tablets", label: "Mobile Phones", kind: "official", listingMode: "shop", visible: true, openForApply: true, sortOrder: 30, parentSlug: null, depth: 0, hasChildren: true },
  { slug: "electronics", label: "Electronics", kind: "official", listingMode: "shop", visible: true, openForApply: true, sortOrder: 40, parentSlug: null, depth: 0, hasChildren: true },
  { slug: "services", label: "Services", kind: "official", listingMode: "services", visible: true, openForApply: true, sortOrder: 170, parentSlug: null, depth: 0, hasChildren: true },
  { slug: "stays", label: "Stays", kind: "official", listingMode: "shop", visible: true, openForApply: true, sortOrder: 180, parentSlug: null, depth: 0, hasChildren: true },
  { slug: "taxi", label: "Taxi", kind: "official", listingMode: "services", visible: true, openForApply: true, sortOrder: 190, parentSlug: null, depth: 0, hasChildren: true },
  { slug: "rider", label: "Rider", kind: "official", listingMode: "services", visible: true, openForApply: true, sortOrder: 195, parentSlug: null, depth: 0, hasChildren: true },
  {
    slug: "business-and-industry",
    label: "Business & Industry",
    kind: "official",
    listingMode: "shop",
    visible: true,
    openForApply: true,
    sortOrder: 140,
    parentSlug: null,
    depth: 0,
    hasChildren: true,
  },
  { slug: "cars", label: "Cars", kind: "official", listingMode: "cars", visible: true, openForApply: false, sortOrder: 12, parentSlug: "vehicles", depth: 1, hasChildren: false },
  { slug: "mobile-phones", label: "Mobile Phones", kind: "official", listingMode: "shop", visible: true, openForApply: true, sortOrder: 32, parentSlug: "mobile-phones-tablets", depth: 1, hasChildren: false },
  { slug: "general-merchandise", label: "General Merchandise", kind: "official", listingMode: "shop", visible: true, openForApply: true, sortOrder: 145, parentSlug: "business-and-industry", depth: 1, hasChildren: false },
];