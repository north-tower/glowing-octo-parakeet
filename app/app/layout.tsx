import type { Metadata } from "next";
import NakuruAppBody from "@/app/app/NakuruAppBody";

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
  return <NakuruAppBody>{children}</NakuruAppBody>;
}