"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/app/AppAuthProvider";
import { useNakuruApp } from "@/components/app/AppProvider";
import {
  readSavedListingIds,
  withToggledSavedId,
  writeSavedListingIds,
} from "@/lib/nakuru/saved-listings";
import { requireAuth } from "@/lib/nakuru/require-auth";
import { signInHref } from "@/lib/nakuru/post-sign-in-tab";
import { useRouter } from "next/navigation";

export function useSavedListing(listingId: string) {
  const { user } = useAuth();
  const { toast } = useNakuruApp();
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const ids = readSavedListingIds();
    setSaved(ids.includes(String(listingId)));
    setReady(true);
  }, [listingId]);

  const toggle = useCallback(() => {
    const path = `/app/p/${listingId}`;
    if (
      !requireAuth(user, { tab: "acc", path }, () => {
        router.push(signInHref(path));
      })
    ) {
      return;
    }
    const next = withToggledSavedId(readSavedListingIds(), String(listingId));
    writeSavedListingIds(next);
    const now = next.includes(String(listingId));
    setSaved(now);
    toast(now ? "Saved" : "Removed from saved");
  }, [listingId, router, toast, user]);

  return { saved: ready ? saved : false, toggle };
}
