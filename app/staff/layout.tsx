import type { Metadata } from "next";
import StaffBody from "@/app/staff/StaffBody";
import { StaffAuthShell } from "@/components/staff/StaffAuthShell";

export const metadata: Metadata = {
  title: "Operations",
  robots: { index: false, follow: false },
};

export default function StaffLayout({ children }: LayoutProps<"/staff">) {
  return (
    <StaffBody>
      <StaffAuthShell>{children}</StaffAuthShell>
    </StaffBody>
  );
}