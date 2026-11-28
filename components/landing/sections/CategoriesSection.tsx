"use client";

import { Bi } from "@/components/landing/Bi";
import { BrowseStyleTileLink } from "@/components/app/category/browse/BrowseStyleTile";
import { groupOfficialRoots } from "@/lib/nakuru/category-hub-groups";
import { presentationForSlug } from "@/lib/nakuru/category-presentation";
import { OFFICIAL_DIRECTORY_FALLBACK } from "@/lib/nakuru/data/category-directory";
import { homeCopy } from "@/lib/nakuru/home-i18n";

const GROUPS = groupOfficialRoots(
  OFFICIAL_DIRECTORY_FALLBACK.filter(
    (r) => r.visible && r.depth === 0 && r.kind === "official",
  ),
);

export function CategoriesSection() {
  return (
    <section id="categories" className="section-after-hero reveal-section browse-cats">
      <div className="wrap">
        <p className="browse-kicker">
          <Bi en="Explore Nakuru" sw="Gundua Nakuru" />
        </p>
        <h2 data-en="Browse by category" data-sw="Vinjari kwa kategoria">
          Browse by category
        </h2>
        <p
          className="section-intro mut"
          data-en="Whatever you are looking for, start here."
          data-sw="Cho chote unachotafuta, anzia hapa."
        >
          Whatever you are looking for, start here.
        </p>
        <div className="browse-by-type">
          {GROUPS.map(({ group, items }) => (
            <section key={group.id} className="browse-group">
              <h3 className="browse-group__title">
                <Bi
                  en={homeCopy(group.titleKey, "en")}
                  sw={homeCopy(group.titleKey, "sw")}
                />
              </h3>
              <div className="browse-grid">
                {items.map((row) => {
                  const visual = presentationForSlug(row.slug);
                  return (
                    <BrowseStyleTileLink
                      key={row.slug}
                      href={`/app?tab=cat&side=${row.slug}`}
                      label={row.label}
                      icon={visual.icon}
                      tint={visual.tint}
                    />
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
