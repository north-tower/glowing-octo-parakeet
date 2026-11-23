"use client";

import { useMemo, useState } from "react";
import { HomeSectionHeader } from "@/components/app/HomeSectionHeader";
import { CategoryGroup } from "@/components/app/category/browse/CategoryGroup";
import { BROWSE_CATEGORY_GROUPS } from "@/components/app/category/browse/categories";
import { homeCopy } from "@/lib/nakuru/home-i18n";
import type { LandingLang } from "@/lib/nakuru/i18n";

type Props = {
  lang: LandingLang;
};

export function BrowseByTypeSection({ lang }: Props) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const groups = useMemo(() => {
    if (!q) return BROWSE_CATEGORY_GROUPS;
    return BROWSE_CATEGORY_GROUPS.map((group) => ({
      ...group,
      items: group.items.filter((item) => item.label.toLowerCase().includes(q)),
    })).filter((group) => group.items.length > 0);
  }, [q]);

  const isEmpty = q.length > 0 && groups.length === 0;

  return (
    <div className="browse-by-type">
      <HomeSectionHeader titleKey="browseByType" lang={lang} noMarker />
      <label className="browse-search-wrap">
        <span className="sr-only">
          {homeCopy("categorySearchPlaceholder", lang)}
        </span>
        <input
          type="search"
          className="browse-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={homeCopy("categorySearchPlaceholder", lang)}
          autoComplete="off"
        />
      </label>
      {isEmpty ? (
        <p className="browse-empty" role="status">
          No categories match
        </p>
      ) : (
        <div className="browse-groups">
          {groups.map((group) => (
            <CategoryGroup key={group.id} group={group} />
          ))}
        </div>
      )}
    </div>
  );
}