"use client";

import { useEffect, useMemo, useState } from "react";
import { ITEMS } from "@/lib/nakuru/data/items";
import { FEAT, TOPC } from "@/lib/nakuru/data/constants";
import { homeTopCategoryLabel } from "@/lib/nakuru/home-i18n";
import type { LandingLang } from "@/lib/nakuru/i18n";

type Hit =
  | { kind: "recent"; id: string; label: string }
  | { kind: "listing"; id: string; label: string }
  | { kind: "category"; id: string; label: string; index: number }
  | { kind: "seller"; id: string; label: string };

const RECENT_KEY = "nh-recent-searches";

type Props = {
  lang: LandingLang;
  query: string;
  open: boolean;
  activeIndex: number;
  onActiveIndex: (n: number) => void;
  onPickQuery: (q: string) => void;
  onPickListing: (id: string) => void;
  onPickCategory: (index: number) => void;
};

export function SearchSuggest({
  lang,
  query,
  open,
  activeIndex,
  onActiveIndex,
  onPickQuery,
  onPickListing,
  onPickCategory,
}: Props) {
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(RECENT_KEY);
      if (raw) setRecent(JSON.parse(raw) as string[]);
    } catch {
      setRecent([]);
    }
  }, [open]);

  const hits = useMemo(() => {
    const q = query.trim().toLowerCase();
    const out: Hit[] = [];
    if (!q) {
      recent.slice(0, 5).forEach((r, i) =>
        out.push({ kind: "recent", id: `r-${i}`, label: r }),
      );
      return out;
    }
    FEAT.forEach((k) => {
      const t = TOPC[k]!;
      const label = t[3] ? homeTopCategoryLabel(t[3], lang) : t[1];
      if (label.toLowerCase().includes(q) || t[1].toLowerCase().includes(q)) {
        out.push({ kind: "category", id: `c-${k}`, label, index: k });
      }
    });
    const sellers = new Set<string>();
    ITEMS.forEach((item) => {
      if (out.length > 12) return;
      if (item.t.toLowerCase().includes(q)) {
        out.push({
          kind: "listing",
          id: String(item.id),
          label: item.t,
        });
      } else if (
        item.s.toLowerCase().includes(q) &&
        !sellers.has(item.s)
      ) {
        sellers.add(item.s);
        out.push({ kind: "seller", id: `s-${item.s}`, label: item.s });
      }
    });
    return out.slice(0, 12);
  }, [lang, query, recent]);

  if (!open || !hits.length) return null;

  const groups = {
    recent: hits.filter((h) => h.kind === "recent"),
    category: hits.filter((h) => h.kind === "category"),
    listing: hits.filter((h) => h.kind === "listing"),
    seller: hits.filter((h) => h.kind === "seller"),
  };

  let i = -1;
  const render = (h: Hit) => {
    i += 1;
    const idx = i;
    return (
      <button
        key={h.id}
        type="button"
        className="search-suggest-item"
        aria-selected={activeIndex === idx}
        onMouseEnter={() => onActiveIndex(idx)}
        onClick={() => {
          if (h.kind === "listing") onPickListing(h.id);
          else if (h.kind === "category") onPickCategory(h.index);
          else onPickQuery(h.label);
        }}
      >
        {h.label}
      </button>
    );
  };

  return (
    <div className="search-suggest" role="listbox">
      {groups.recent.length ? (
        <>
          <span className="search-suggest-label">Recent</span>
          {groups.recent.map(render)}
        </>
      ) : null}
      {groups.category.length ? (
        <>
          <span className="search-suggest-label">Categories</span>
          {groups.category.map(render)}
        </>
      ) : null}
      {groups.listing.length ? (
        <>
          <span className="search-suggest-label">Listings</span>
          {groups.listing.map(render)}
        </>
      ) : null}
      {groups.seller.length ? (
        <>
          <span className="search-suggest-label">Sellers</span>
          {groups.seller.map(render)}
        </>
      ) : null}
    </div>
  );
}

export function rememberSearch(q: string) {
  const t = q.trim();
  if (!t || typeof window === "undefined") return;
  try {
    const prev = JSON.parse(sessionStorage.getItem(RECENT_KEY) ?? "[]") as string[];
    const next = [t, ...prev.filter((x) => x !== t)].slice(0, 8);
    sessionStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}
