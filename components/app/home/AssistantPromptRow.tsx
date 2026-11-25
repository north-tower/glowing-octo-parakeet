"use client";

import { IconSparkle } from "@/components/app/icons/LineIcons";
import { homeCopy, type HomeCopyKey } from "@/lib/nakuru/home-i18n";
import type { LandingLang } from "@/lib/nakuru/i18n";

const CHIPS: { key: HomeCopyKey; prompt: string }[] = [
  { key: "askChipPhones", prompt: "Cheap phones in Nakuru" },
  { key: "askChipPlumber", prompt: "Plumber near Milimani" },
  { key: "askChipRent", prompt: "Houses to rent under 20k" },
];

type Props = {
  lang: LandingLang;
  onAsk: (prompt?: string) => void;
};

export function AssistantPromptRow({ lang, onAsk }: Props) {
  return (
    <div className="ask-row" onClick={() => onAsk()}>
      <span className="ask-row-icon" aria-hidden>
        <IconSparkle size={18} />
      </span>
      <div className="ask-row-body">
        <button type="button" className="ask-row-copy">
          {homeCopy("assistantPromptRow", lang)}
        </button>
        <div className="ask-row-chips">
          {CHIPS.map((c) => (
            <button
              key={c.key}
              type="button"
              className="ask-chip"
              onClick={(e) => {
                e.stopPropagation();
                onAsk(homeCopy(c.key, lang));
              }}
            >
              {homeCopy(c.key, lang)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
