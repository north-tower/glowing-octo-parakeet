import type { Listing } from "@/lib/nakuru/types";

const liveById = new Map<string, Listing>();

export function isLiveCatalogEnabled(): boolean {
  return process.env.NEXT_PUBLIC_USE_LIVE_CATALOG === "true";
}

export function getLiveListingById(id: string): Listing | undefined {
  return liveById.get(id);
}

export function syncLiveListings(items: Listing[]): void {
  for (const item of items) {
    liveById.set(String(item.id), item);
  }
}