"use client";

import { useCallback, useRef, type KeyboardEvent } from "react";
import { useNakuruApp } from "@/components/app/AppProvider";
import { SIDE, SOON, type SideRailIcon } from "@/lib/nakuru/data/constants";
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
      "button.cat-rail-item:not(:disabled)",
    );
    const btn = buttons[index];
    btn?.focus();
  };

  const onKeyDown = useCallback(
    (e: KeyboardEvent, index: number) => {
      const enabled: number[] = [];
      SIDE.forEach((row, i) => {
        if (!SOON[row[0] as CategoryId]) enabled.push(i);
      });
      const pos = enabled.indexOf(index);
      if (pos < 0) return;

      let next = pos;
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        next = (pos + 1) % enabled.length;
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        next = (pos - 1 + enabled.length) % enabled.length;
      } else if (e.key === "Home") {
        e.preventDefault();
        next = 0;
      } else if (e.key === "End") {
        e.preventDefault();
        next = enabled.length - 1;
      } else {
        return;
      }
      focusIndex(enabled[next]!);
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
        const soon = Boolean(SOON[id as CategoryId]);
        const active = !soon && s === id;
        const Icon = RAIL_ICONS[iconKey];
        const label = sideLabel(id, lang);

        return (
          <button
            key={id}
            type="button"
            className={`cat-rail-item${active ? " on" : ""}${soon ? " is-soon" : ""}`}
            disabled={soon}
            aria-disabled={soon}
            aria-current={active ? "true" : undefined}
            onClick={() => {
              if (soon) return;
              dispatch({ type: "SET_SIDE", side: id });
            }}
            onKeyDown={(e) => onKeyDown(e, index)}
          >
            <span className="cat-rail-icon" aria-hidden>
              {Icon ? <Icon size={24} /> : null}
            </span>
            <span className="cat-rail-label">{label}</span>
            {soon ? (
              <span className="cat-rail-soon">
                {homeCopy("soon", lang)}
              </span>
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}