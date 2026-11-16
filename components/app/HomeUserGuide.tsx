"use client";

import { homeCopy } from "@/lib/nakuru/home-i18n";
import type { LandingLang } from "@/lib/nakuru/i18n";

const STEPS: Array<{
  titleKey:
    | "userGuideStep1Title"
    | "userGuideStep2Title"
    | "userGuideStep3Title"
    | "userGuideStep4Title";
  bodyKey:
    | "userGuideStep1Body"
    | "userGuideStep2Body"
    | "userGuideStep3Body"
    | "userGuideStep4Body";
}> = [
  { titleKey: "userGuideStep1Title", bodyKey: "userGuideStep1Body" },
  { titleKey: "userGuideStep2Title", bodyKey: "userGuideStep2Body" },
  { titleKey: "userGuideStep3Title", bodyKey: "userGuideStep3Body" },
  { titleKey: "userGuideStep4Title", bodyKey: "userGuideStep4Body" },
];

type Props = {
  open: boolean;
  lang: LandingLang;
  onClose: () => void;
};

export function HomeUserGuide({ open, lang, onClose }: Props) {
  if (!open) return null;

  return (
    <section
      className="home-guide card"
      aria-labelledby="home-guide-title"
      data-testid="home-user-guide"
    >
      <div className="home-guide-head">
        <h2 id="home-guide-title" className="t home-guide-title">
          {homeCopy("userGuideTitle", lang)}
        </h2>
        <button
          type="button"
          className="home-guide-close"
          onClick={onClose}
          aria-label={homeCopy("userGuideDismiss", lang)}
        >
          ×
        </button>
      </div>
      <ol className="home-guide-steps">
        {STEPS.map((step, i) => (
          <li key={step.titleKey} className="home-guide-step">
            <span className="home-guide-num" aria-hidden>
              {i + 1}
            </span>
            <span className="home-guide-step-copy">
              <b>{homeCopy(step.titleKey, lang)}</b>
              <span className="m">{homeCopy(step.bodyKey, lang)}</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}