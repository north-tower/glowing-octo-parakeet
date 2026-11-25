"use client";

import { IconSparkle } from "@/components/app/icons/LineIcons";
import { homeCopy } from "@/lib/nakuru/home-i18n";
import type { LandingLang } from "@/lib/nakuru/i18n";

type Props = {
  lang: LandingLang;
  onAsk: () => void;
};

export function AssistantPromptRow({ lang, onAsk }: Props) {
  return (
    <button type="button" className="ask-row" onClick={onAsk}>
      <span className="ask-row-icon" aria-hidden>
        <IconSparkle size={18} />
      </span>
      <span className="ask-row-copy">{homeCopy("assistantPromptRow", lang)}</span>
    </button>
  );
}
