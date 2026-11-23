import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./nakuru/styles.css";
import { nakuruFontClassName } from "@/lib/nakuru/fonts";
import {
  jsonLdString,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  siteJsonLd,
} from "@/lib/seo/site";

const DEFAULT_TITLE = "NakuruHub — Buy, Sell & Rent in Nakuru, Kenya";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: "%s | NakuruHub",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "Nakuru",
    "Nakuru marketplace",
    "houses for rent in Nakuru",
    "land for sale in Nakuru",
    "cars for sale in Nakuru",
    "Nakuru services",
    "Nakuru shops",
    "Nakuru County",
    "Kenya marketplace",
  ],
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: { "max-image-preview": "large", "max-snippet": -1 },
  },
  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } }
    : {}),
  openGraph: {
    title: DEFAULT_TITLE,
    description:
      "Shops, homes, land, cars, and services in Nakuru County. Free to join and list on NakuruHub.",
    type: "website",
    siteName: SITE_NAME,
    locale: "en_KE",
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description:
      "Shops, homes, land, cars, and services in Nakuru County. Free to join and list on NakuruHub.",
  },
  appleWebApp: {
    capable: true,
    title: "NakuruHub",
    statusBarStyle: "default",
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
    shortcut: "/icons/favicon-32.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0d5c58",
  colorScheme: "only light",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-KE" data-theme="light" className={nakuruFontClassName}>
      {/* Phase 3: scope `landing` to `/` only via route layout */}
      <body className="landing">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdString(siteJsonLd()) }}
        />
        {children}
      </body>
    </html>
  );
}