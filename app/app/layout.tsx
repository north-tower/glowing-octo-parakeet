import type { Metadata } from "next";
import { Suspense } from "react";
import NakuruAppBody from "@/app/app/NakuruAppBody";
import { AppProvider } from "@/components/app/AppProvider";

export const metadata: Metadata = {
  title: "NakuruHub",
  description:
    "Browse shops, homes, cars, and services in Nakuru County. Demo marketplace — data resets on reload.",
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