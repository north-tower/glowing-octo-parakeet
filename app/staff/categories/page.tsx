"use client";

import { StaffAdminOnly } from "@/components/staff/StaffAdminOnly";
import { StaffCategoryPanel } from "@/components/staff/StaffCategoryPanel";

export default function StaffCategoriesPage() {
  return (
    <StaffAdminOnly>
      <StaffCategoryPanel />
    </StaffAdminOnly>
  );
}