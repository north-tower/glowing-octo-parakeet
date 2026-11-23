import type { Metadata } from "next";
import { Suspense } from "react";
import NakuruAppBody from "@/app/app/NakuruAppBody";
import { AppProvider } from "@/components/app/AppProvider";
import { defaultShareImages, SITE_NAME } from "@/lib/seo/site";

const APP_TITLE = "Browse shops, homes, cars & services in Nakuru";
const APP_DESCRIPTION =
  "Search and browse live listings — shops, property, cars, stays, taxi, and services across Nakuru County. Category and area guides live at /nakuru.";

export const metadata: Metadata = {
  title: APP_TITLE,
  description: APP_DESCRIPTION,
  alternates: { canonical: "/app" },
  robots: {
    index: true,
    follow: true,
    googleBot: { "max-image-preview": "large", "max-snippet": -1 },
  },
  openGraph: {
    title: APP_TITLE,
    description: APP_DESCRIPTION,
    url: "/app",
    type: "website",
    siteName: SITE_NAME,
    locale: "en_KE",
    images: defaultShareImages(),
  },
  twitter: {
    card: "summary_large_image",
    title: APP_TITLE,
    description: APP_DESCRIPTION,
    images: defaultShareImages().map((img) => img.url),
  },
};

export default function NakuruAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NakuruAppBody>
      <Suspense fallback={null}>
        <AppProvider>{children}</AppProvider>
      </Suspense>
    </NakuruAppBody>
  );
}