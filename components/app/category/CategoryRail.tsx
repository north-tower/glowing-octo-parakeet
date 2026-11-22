"use client";

import { useCallback, useRef, type KeyboardEvent } from "react";
import { useNakuruApp } from "@/components/app/AppProvider";
import { SIDE, type SideRailIcon } from "@/lib/nakuru/data/constants";
import {
  homeCategoryLabel,
  homeCopy,
} from "@/lib/nakuru/home-i18n";
import type { CategoryId } from "@/lib/nakuru/types";
import type { LandingLang } from "@/lib/nakuru/i18n";
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

function sideLabel(sideId: string, lang: LandingLang): string {
  if (sideId === "feat") return homeCopy("sideFeatured", lang);
  return homeCategoryLabel(sideId as CategoryId, lang);
}

type Props = { lang: LandingLang };

export function CategoryRail({ lang }: Props) {
  const { state, dispatch } = useNakuruApp();
  const s = state.side;
  const railRef = useRef<HTMLDivElement>(null);

  const focusIndex = (index: number) => {
    const rail = railRef.current;
    if (!rail) return;
    const buttons = rail.querySelectorAll<HTMLButtonElement>(
      "button.cat-rail-item",
    );
    const btn = buttons[index];
    btn?.focus();
  };

  const onKeyDown = useCallback(
    (e: KeyboardEvent, index: number) => {
      const total = SIDE.length;
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
    [],
  );

  return (
    <nav
      className="cat-rail sd"
      aria-label={homeCopy("categoryRailAria", lang)}
      ref={railRef}
    >
      {SIDE.map(([id, , iconKey], index) => {
        const active = s === id;
        const Icon = RAIL_ICONS[iconKey];
        const label = sideLabel(id, lang);

        return (
          <button
            key={id}
            type="button"
            className={`cat-rail-item${active ? " on" : ""}`}
            aria-current={active ? "true" : undefined}
            onClick={() => dispatch({ type: "SET_SIDE", side: id })}
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