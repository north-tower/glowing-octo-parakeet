import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";

type HeroSideCardProps = {
  icon: LucideIcon;
  tone?: "pri" | "fl";
  title: string;
  description: string;
  linkLabel: string;
  onLinkClick: () => void;
};

export function HeroSideCard({
  icon: Icon,
  tone = "pri",
  title,
  description,
  linkLabel,
  onLinkClick,
}: HeroSideCardProps) {
  return (
    <article className="hero-side-card">
      <div
        className={`hero-side-icon${tone === "fl" ? " hero-side-icon--fl" : ""}`}
        aria-hidden
      >
        <Icon size={20} strokeWidth={2} />
      </div>
      <h3 className="hero-side-title">{title}</h3>
      <p className="hero-side-copy">{description}</p>
      <button type="button" className="hero-side-link" onClick={onLinkClick}>
        <span>{linkLabel}</span>
        <ArrowRight size={16} aria-hidden />
      </button>
    </article>
  );
}
