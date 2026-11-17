import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./nakuru-globals.css";
import { nakuruFontClassName } from "@/lib/nakuru/fonts";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://nakuruhub.example");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "NakuruHub — Sell to Nakuru from one place",
    template: "%s | NakuruHub",
  },
  description:
    "NakuruHub — Nakuru’s marketplace for shop, property, cars, and services. Free to join and list. Soko la Nakuru — jiunga na uorodheshaje bure.",
  applicationName: "NakuruHub",
  openGraph: {
    title: "NakuruHub — Sell to Nakuru from one place",
    description:
      "List shop, homes, cars, or services in Nakuru County. Free to join and list on NakuruHub.",
    type: "website",
    siteName: "NakuruHub",
    locale: "en_KE",
  },
  twitter: {
    card: "summary",
    title: "NakuruHub — Sell to Nakuru from one place",
    description:
      "List shop, homes, cars, or services in Nakuru County. Free to join and list on NakuruHub.",
  },
  appleWebApp: {
    capable: true,
    title: "NakuruHub",
    statusBarStyle: "default",
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0d5c58",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={nakuruFontClassName}>
      {/* Phase 3: scope `landing` to `/` only via route layout */}
      <body className="landing">{children}</body>
    </html>
  );
}