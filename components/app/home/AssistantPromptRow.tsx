"use client";

import { IconSparkle } from "@/components/app/icons/LineIcons";
import { homeCopy, type HomeCopyKey } from "@/lib/nakuru/home-i18n";
import type { LandingLang } from "@/lib/nakuru/i18n";

const CHIPS: { key: HomeCopyKey; prompt: string }[] = [
  { key: "askChipPhones", prompt: "Cheap phones in Nakuru" },
  { key: "askChipPlumber", prompt: "Plumber near me" },
  { key: "askChipRent", prompt: "Houses to rent" },
  { key: "askChipVerified", prompt: "Verified shops in Nakuru" },
];

type Props = {
  lang: LandingLang;
  onAsk: (prompt?: string) => void;
};

export function AssistantPromptRow({ lang, onAsk }: Props) {
  return (
    <div className="ask-row">
      <button
        type="button"
        className="ask-row-head"
        onClick={() => onAsk()}
      >
        <span className="ask-row-icon" aria-hidden>
          <IconSparkle size={18} />
        </span>
        <span className="ask-row-copy">
          <span className="ask-row-title">{homeCopy("assistantPromptRow", lang)}</span>
          <span className="ask-row-sub">
            {homeCopy("assistantPromptRowSub", lang)}
          </span>
        </span>
      </button>
      <div className="ask-row-chips">
        {CHIPS.map((c) => (
          <button
            key={c.key}
            type="button"
            className="ask-chip"
            onClick={() => onAsk(c.prompt)}
          >
            {homeCopy(c.key, lang)}
          </button>
        ))}
      </div>
    </div>
  );
}
