"use client";

import { useCallback, useMemo, useRef, type KeyboardEvent } from "react";
import { useNakuruApp } from "@/components/app/AppProvider";
import {
  homeCategoryLabel,
  homeCopy,
} from "@/lib/nakuru/home-i18n";
import type { CategoryId } from "@/lib/nakuru/types";
import type { LandingLang } from "@/lib/nakuru/i18n";
import { useCategories } from "@/lib/nakuru/use-categories";
import { listingModeRailIcon } from "@/lib/nakuru/listing-mode-icon";
import type { SideRailIcon } from "@/lib/nakuru/data/constants";
import {
  IconBed,
  IconCar,
  IconHome,
  IconShoppingBag,
  IconSparkle,
  IconTaxi,
  IconTools,
} from "@/components/app/icons/LineIcons";

const RAIL_ICONS: Record<
  SideRailIcon,
  (props: { size?: number }) => React.ReactNode
> = {
  sparkle: IconSparkle,
  "shopping-bag": IconShoppingBag,
  home: IconHome,
  car: IconCar,
  wrench: IconTools,
  bed: IconBed,
  taxi: IconTaxi,
};

const NAKURU_ICON: Record<string, SideRailIcon> = {
  stays: "bed",
  taxi: "taxi",
  rider: "taxi",
};

function sideLabel(
  sideId: string,
  fallback: string,
  lang: LandingLang,
): string {
  if (sideId === "feat") return homeCopy("sideFeatured", lang);
  const localized = homeCategoryLabel(sideId as CategoryId, lang);
  if (localized !== sideId) return localized;
  return fallback;
}

type Props = { lang: LandingLang };

export function CategoryRail({ lang }: Props) {
  const { state, dispatch } = useNakuruApp();
  const { rows } = useCategories();
  const s = state.side;
  const railRef = useRef<HTMLDivElement>(null);

  const roots = useMemo(
    () =>
      rows
        .filter((r) => r.depth === 0 && r.kind === "official")
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [rows],
  );

  const railItems = useMemo(() => {
    return [
      { id: "feat", label: homeCopy("sideFeatured", lang), icon: "sparkle" as const },
      ...roots.map((r) => ({
        id: r.slug,
        label: r.label,
        icon: NAKURU_ICON[r.slug] ?? listingModeRailIcon(r.listingMode),
      })),
    ];
  }, [roots, lang]);

  const focusIndex = (index: number) => {
    const rail = railRef.current;
    if (!rail) return;
    const buttons = rail.querySelectorAll<HTMLButtonElement>(
      "button.cat-rail-item",
    );
    buttons[index]?.focus();
  };

  const onKeyDown = useCallback(
    (e: KeyboardEvent, index: number) => {
      const total = railItems.length;
      let next = index;
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        next = (index + 1) % total;
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        next = (index - 1 + total) % total;
      } else if (e.key === "Home") {
        e.preventDefault();
        next = 0;
      } else if (e.key === "End") {
        e.preventDefault();
        next = total - 1;
      } else {
        return;
      }
      focusIndex(next);
    },
    [railItems.length],
  );

  return (
    <nav
      className={`cat-rail sd${roots.length > 10 ? " cat-rail--dense" : ""}`}
      aria-label={homeCopy("categoryRailAria", lang)}
      ref={railRef}
    >
      {railItems.map((item, index) => {
        const active = s === item.id;
        const Icon = RAIL_ICONS[item.icon];
        const label = sideLabel(item.id, item.label, lang);

        return (
          <button
            key={item.id}
            type="button"
            className={`cat-rail-item${active ? " on" : ""}`}
            aria-current={active ? "true" : undefined}
            onClick={() => dispatch({ type: "SET_SIDE", side: item.id })}
            onKeyDown={(e) => onKeyDown(e, index)}
          >
            <span className="cat-rail-icon" aria-hidden>
              {Icon ? <Icon size={24} /> : null}
            </span>
            <span className="cat-rail-label">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}