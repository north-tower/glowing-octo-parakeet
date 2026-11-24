"use client";

import { StaffAdminOnly } from "@/components/staff/StaffAdminOnly";
import { StaffOrdersPanel } from "@/components/staff/StaffOrdersPanel";

export default function StaffOrdersPage() {
  return (
    <StaffAdminOnly>
      <StaffOrdersPanel />
    </StaffAdminOnly>
  );
}