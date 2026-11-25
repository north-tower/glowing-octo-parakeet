"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { homeCopy } from "@/lib/nakuru/home-i18n";
import { useCategories } from "@/lib/nakuru/use-categories";
import type { LandingLang } from "@/lib/nakuru/i18n";

type Props = {
  lang: LandingLang;
  open: boolean;
  onClose: () => void;
  onSelect: (slug: string) => void;
};

export function CategoryMegaMenu({ lang, open, onClose, onSelect }: Props) {
  const { rows } = useCategories();
  const rootRef = useRef<HTMLDivElement>(null);
  const parents = useMemo(
    () => rows.filter((r) => !r.parentSlug && r.visible),
    [rows],
  );
  const [active, setActive] = useState(parents[0]?.slug ?? "");

  useEffect(() => {
    if (open && parents[0]) setActive(parents[0].slug);
  }, [open, parents]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const onPtr = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) onClose();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPtr);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPtr);
    };
  }, [open, onClose]);

  if (!open) return null;

  const children = rows.filter((r) => r.parentSlug === active);

  return (
    <div className="cat-mega" ref={rootRef} role="menu" aria-label={homeCopy("navCategory", lang)}>
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
            {p.label}
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
              {c.label}
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
  );
}
