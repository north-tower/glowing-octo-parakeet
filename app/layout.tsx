import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./nakuru-globals.css";

export const metadata: Metadata = {
  title: "NakuruHub — Sell to Nakuru from one place",
  description:
    "NakuruHub — Nakuru’s marketplace for shop, property, cars, and services. Free to join and list. Soko la Nakuru — jiunga na uorodheshaje bure.",
  openGraph: {
    title: "NakuruHub — Sell to Nakuru from one place",
    description:
      "List shop, homes, cars, or services in Nakuru County. Free to join and list on NakuruHub.",
    type: "website",
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: {
      url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Ctext y='26' x='2' font-size='24'%3E%F0%9F%A6%A9%3C/text%3E%3C/svg%3E",
    },
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
      {/* Phase 3: scope `landing` to `/` only via route layout */}
      <body className="landing">{children}</body>
    </html>
  );
}