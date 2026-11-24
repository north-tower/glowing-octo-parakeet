"use client";

import { StaffAdminOnly } from "@/components/staff/StaffAdminOnly";
import { StaffOverviewPanel } from "@/components/staff/StaffOverviewPanel";
import { useStaffSession } from "@/components/staff/StaffSessionContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function StaffOverviewPage() {
  const { me } = useStaffSession();
  const router = useRouter();

  useEffect(() => {
    if (me.role === "support") {
      router.replace("/staff/vendors");
    }
  }, [me.role, router]);

  if (me.role === "support") {
    return null;
  }

  return (
    <StaffAdminOnly>
      <StaffOverviewPanel />
    </StaffAdminOnly>
  );
}