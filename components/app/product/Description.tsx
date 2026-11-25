"use client";

import { useEffect, useId, useRef, useState } from "react";
import { homeCopy } from "@/lib/nakuru/home-i18n";
import type { LandingLang } from "@/lib/nakuru/i18n";
import {
  cleanDescription,
  descriptionHasContent,
} from "@/lib/nakuru/clean-description";

type Props = {
  lang: LandingLang;
  raw: string | undefined;
};

export function Description({ lang, raw }: Props) {
  const titleId = useId();
  const bodyId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [clamped, setClamped] = useState(false);
  const cleaned = cleanDescription(raw);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || expanded) return;
    setClamped(el.scrollHeight > el.clientHeight + 2);
  }, [raw, expanded, lang]);

  if (!descriptionHasContent(cleaned)) return null;

  return (
    <section className="card pd-card pd-about" aria-labelledby={titleId}>
      <h2 id={titleId} className="pd-about-title">
        {homeCopy("productAbout", lang)}
      </h2>
      <div
        ref={wrapRef}
        id={bodyId}
        className={`pd-about-stack${expanded ? "" : " pd-about-stack--clamp"}`}
      >
        {cleaned.paragraphs.map((p) => (
          <p key={p.slice(0, 24)} className="pd-about-body">
            {p}
          </p>
        ))}
        {cleaned.bullets.length ? (
          <ul className="pd-about-bullets">
            {cleaned.bullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}
      </div>
      {clamped ? (
        <button
          type="button"
          className="pd-read-more"
          aria-expanded={expanded}
          aria-controls={bodyId}
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded
            ? homeCopy("productReadLess", lang)
            : homeCopy("productReadMore", lang)}
        </button>
      ) : null}
    </section>
  );
}
