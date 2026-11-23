"use client";

import { useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useNakuruApp } from "@/components/app/AppProvider";
import { appCategoryHref } from "@/lib/nakuru/app-nav-href";
import { homeCopy } from "@/lib/nakuru/home-i18n";
import type { LandingLang } from "@/lib/nakuru/i18n";
import { useCategories } from "@/lib/nakuru/use-categories";
import { IconSparkle } from "@/components/app/icons/LineIcons";

type Props = { lang: LandingLang };

export function CategoryHubNav({ lang }: Props) {
  const { state, dispatch } = useNakuruApp();
  const router = useRouter();
  const { rows } = useCategories();
  const trackRef = useRef<HTMLDivElement>(null);

  const roots = useMemo(
    () =>
      rows
        .filter((r) => r.depth === 0 && r.kind === "official")
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [rows],
  );

  const scrollChipIntoView = useCallback((slug: string) => {
    const track = trackRef.current;
    if (!track) return;
    const el = track.querySelector<HTMLElement>(`[data-hub-slug="${slug}"]`);
    el?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, []);

  const select = (slug: string) => {
    dispatch({ type: "SET_CAT", cat: "all" });
    dispatch({ type: "SET_SIDE", side: slug });
    router.push(appCategoryHref({ side: slug }));
    scrollChipIntoView(slug);
  };

  const active = state.side;

  return (
    <div className="cat-hub-nav" role="navigation" aria-label={homeCopy("categoryHubNav", lang)}>
      <div className="cat-hub-track" ref={trackRef}>
        <button
          type="button"
          data-hub-slug="feat"
          className={`cat-hub-chip${active === "feat" ? " on" : ""}`}
          onClick={() => select("feat")}
        >
          <IconSparkle size={16} aria-hidden />
          {homeCopy("sideFeatured", lang)}
        </button>
        {roots.map((r) => (
          <button
            key={r.slug}
            type="button"
            data-hub-slug={r.slug}
            className={`cat-hub-chip${active === r.slug ? " on" : ""}`}
            onClick={() => select(r.slug)}
          >
            {r.label}
          </button>
        ))}
      </div>
    </div>
  );
}