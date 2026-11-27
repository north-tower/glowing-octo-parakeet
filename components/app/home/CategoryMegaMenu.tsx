"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { homeCopy } from "@/lib/nakuru/home-i18n";
import { presentationForSlug } from "@/lib/nakuru/category-presentation";
import { useCategories } from "@/lib/nakuru/use-categories";
import type { LandingLang } from "@/lib/nakuru/i18n";

type Props = {
  lang: LandingLang;
  open: boolean;
  onClose: () => void;
  onSelect: (slug: string) => void;
};

function MegaThumb({ slug }: { slug: string }) {
  const src = presentationForSlug(slug).image;
  if (!src) return null;
  return (
    <Image
      src={src}
      alt=""
      width={32}
      height={32}
      className="cat-mega-thumb"
      draggable={false}
    />
  );
}

export function CategoryMegaMenu({ lang, open, onClose, onSelect }: Props) {
  const { rows } = useCategories();
  const parents = useMemo(
    () => rows.filter((r) => !r.parentSlug && r.visible),
    [rows],
  );
  const [active, setActive] = useState(parents[0]?.slug ?? "");

  useEffect(() => {
    if (open && parents[0] && !parents.some((p) => p.slug === active)) {
      setActive(parents[0].slug);
    }
  }, [open, parents, active]);

  if (!open) return null;

  const children = rows.filter((r) => r.parentSlug === active);

  return (
    <div className="cat-mega" role="menu" aria-label={homeCopy("navCategory", lang)}>
      <div className="cat-mega-panel">
        <div className="cat-mega-list">
          {parents.map((p) => (
            <button
              key={p.slug}
              type="button"
              role="menuitem"
              className={`cat-mega-item${active === p.slug ? " on" : ""}`}
              onMouseEnter={() => setActive(p.slug)}
              onFocus={() => setActive(p.slug)}
              onClick={() => {
                onSelect(p.slug);
                onClose();
              }}
            >
              <MegaThumb slug={p.slug} />
              <span>{p.label}</span>
            </button>
          ))}
        </div>
        <div className="cat-mega-subs">
          {children.length ? (
            children.map((c) => (
              <button
                key={c.slug}
                type="button"
                role="menuitem"
                className="cat-mega-item"
                onClick={() => {
                  onSelect(c.slug);
                  onClose();
                }}
              >
                <MegaThumb slug={c.slug} />
                <span>{c.label}</span>
              </button>
            ))
          ) : (
            <button
              type="button"
              className="cat-mega-item"
              onClick={() => {
                onSelect(active);
                onClose();
              }}
            >
              {homeCopy("seeAll", lang)}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
