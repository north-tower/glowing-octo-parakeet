import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./nakuru-globals.css";

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
      {
        url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Ctext y='26' x='2' font-size='24'%3E%F0%9F%A6%A9%3C/text%3E%3C/svg%3E",
      },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/icon.svg",
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
    <html lang="en">
      <head>
        <link
          rel="preload"
          href="/fonts/bricolage-grotesque-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/figtree-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      {/* Phase 3: scope `landing` to `/` only via route layout */}
      <body className="landing">{children}</body>
    </html>
  );
}