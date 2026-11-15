export type LandingLang = "en" | "sw";

export const LANDING_LANG_KEY = "nakuruhub-landing-lang";

export function readStoredLang(): LandingLang {
  if (typeof window === "undefined") return "en";
  const stored = localStorage.getItem(LANDING_LANG_KEY);
  return stored === "sw" ? "sw" : "en";
}

export function storeLang(lang: LandingLang): void {
  localStorage.setItem(LANDING_LANG_KEY, lang);
}

/** DOM walk matching prototype `apply()` — for elements still using data-en/data-sw. */
export function applyLang(lang: LandingLang, root: ParentNode = document): void {
  root.querySelectorAll("[data-en][data-sw]").forEach((el) => {
    const next =
      lang === "sw" ? el.getAttribute("data-sw") : el.getAttribute("data-en");
    if (next) el.textContent = next;
  });
  root.querySelectorAll("[data-en-aria][data-sw-aria]").forEach((el) => {
    const label =
      lang === "sw"
        ? el.getAttribute("data-sw-aria")
        : el.getAttribute("data-en-aria");
    if (label) el.setAttribute("aria-label", label);
  });
  if (typeof document !== "undefined") {
    document.documentElement.lang = lang === "sw" ? "sw" : "en";
  }
}