import type { Metadata } from "next";
import { Suspense } from "react";
import NakuruAppBody from "@/app/app/NakuruAppBody";
import { AppProvider } from "@/components/app/AppProvider";

export const metadata: Metadata = {
  title: "Browse shops, homes, cars & services in Nakuru",
  description:
    "Browse shops, houses and land, cars, and local services across Nakuru County. Contact verified Nakuru vendors on NakuruHub.",
  alternates: { canonical: "/app" },
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