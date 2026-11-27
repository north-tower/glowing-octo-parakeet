"use client";

import { useMemo, useState } from "react";
import { HomeSectionHeader } from "@/components/app/HomeSectionHeader";
import { CategoryGroup } from "@/components/app/category/browse/CategoryGroup";
import type { BrowseCategoryGroup } from "@/components/app/category/browse/categories";
import { groupOfficialRoots } from "@/lib/nakuru/category-hub-groups";
import { presentationForSlug } from "@/lib/nakuru/category-presentation";
import { homeCopy } from "@/lib/nakuru/home-i18n";
import type { LandingLang } from "@/lib/nakuru/i18n";
import { useCategories } from "@/lib/nakuru/use-categories";

type Props = {
  lang: LandingLang;
};

export function BrowseByTypeSection({ lang }: Props) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const { rows } = useCategories();

  const groups = useMemo(() => {
    const roots = rows.filter(
      (r) => r.visible && r.depth === 0 && r.kind === "official",
    );
    const built: BrowseCategoryGroup[] = groupOfficialRoots(roots).map(
      ({ group, items }) => ({
        id: group.id,
        title: homeCopy(group.titleKey, lang),
        items: items.map((row) => {
          const p = presentationForSlug(row.slug);
          return {
            slug: row.slug,
            label: row.label,
            icon: p.icon,
            tint: p.tint,
          };
        }),
      }),
    );
    if (!q) return built;
    return built
      .map((group) => ({
        ...group,
        items: group.items.filter((item) =>
          item.label.toLowerCase().includes(q),
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [q, rows, lang]);

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
