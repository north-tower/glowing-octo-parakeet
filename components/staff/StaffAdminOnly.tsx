"use client";

import Link from "next/link";
import { useStaffSession } from "./StaffSessionContext";
import type { ReactNode } from "react";

export function StaffAdminOnly({ children }: { children: ReactNode }) {
  const { me } = useStaffSession();
  if (me.role !== "admin") {
    return (
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Admin only</h2>
        <p className="m">
          Your support account cannot open this section. Use the vendor queue for
          day-to-day reviews.
        </p>
        <Link href="/staff/vendors" className="btn s">
          Go to vendors
        </Link>
      </div>
    );
  }
  return children;
}