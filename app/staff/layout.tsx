import type { Metadata } from "next";
import StaffBody from "@/app/staff/StaffBody";

export const metadata: Metadata = {
  title: "Staff",
  robots: { index: false, follow: false },
};

export default function StaffLayout({ children }: LayoutProps<"/staff">) {
  return <StaffBody>{children}</StaffBody>;
}