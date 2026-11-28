import type { Metadata } from "next";
import { PosMarketingPage } from "@/components/landing/PosMarketingPage";

export const metadata: Metadata = {
  title: "NakuruHub POS — Till for shops in Nakuru",
  description:
    "NakuruHub POS is the till for shops on NakuruHub — sales, credit, and today’s numbers at the counter. Try the view-only demo.",
  alternates: { canonical: "/pos" },
};

export default function PosPage() {
  return <PosMarketingPage />;
}
