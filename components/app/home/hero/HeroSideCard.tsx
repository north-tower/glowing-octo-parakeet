import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";

type HeroSideCardProps = {
  icon: LucideIcon;
  iconTintClass: string;
  title: string;
  description: string;
  linkLabel: string;
  onLinkClick: () => void;
};

export function HeroSideCard({
  icon: Icon,
  iconTintClass,
  title,
  description,
  linkLabel,
  onLinkClick,
}: HeroSideCardProps) {
  return (
    <article className="group flex h-full min-h-0 flex-1 flex-col rounded-2xl border border-stone-200 bg-white p-5 transition-[border-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-sm">
      <div
        className={`mb-3 flex size-10 items-center justify-center rounded-xl ${iconTintClass}`}
      >
        <Icon className="size-5" strokeWidth={2} aria-hidden />
      </div>
      <h3 className="text-base font-semibold text-stone-900">{title}</h3>
      <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-stone-600 lg:line-clamp-2">
        {description}
      </p>
      <button
        type="button"
        onClick={onLinkClick}
        className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-medium text-emerald-800 hover:text-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d6f69] focus-visible:ring-offset-2"
      >
        <span>{linkLabel}</span>
        <ArrowRight
          className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
          aria-hidden
        />
      </button>
    </article>
  );
}