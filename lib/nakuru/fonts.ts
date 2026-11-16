import localFont from "next/font/local";

/** Self-hosted variable fonts — same files as legacy `@font-face` in `public/fonts/`. */
export const fontDisplay = localFont({
  src: "../../public/fonts/bricolage-grotesque-latin.woff2",
  variable: "--font-display",
  display: "swap",
  weight: "200 800",
  adjustFontFallback: "Arial",
});

export const fontBody = localFont({
  src: "../../public/fonts/figtree-latin.woff2",
  variable: "--font-body",
  display: "swap",
  weight: "300 900",
  adjustFontFallback: "Arial",
});

export const nakuruFontClassName = `${fontDisplay.variable} ${fontBody.variable}`;