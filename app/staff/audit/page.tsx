"use client";

import { StaffAdminOnly } from "@/components/staff/StaffAdminOnly";
import { StaffAuditPanel } from "@/components/staff/StaffAuditPanel";

export default function StaffAuditPage() {
  return (
    <StaffAdminOnly>
      <StaffAuditPanel />
    </StaffAdminOnly>
  );
}