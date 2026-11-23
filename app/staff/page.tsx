"use client";

import { BrandLogoMark } from "@/components/app/BrandLogoMark";
import { StaffLoginForm } from "@/components/staff/StaffLoginForm";
import { BRAND_NAME } from "@/lib/nakuru/brand";
import { StaffVendorQueue } from "@/components/staff/StaffVendorQueue";
import { getStaffAccessToken } from "@/lib/nakuru/staff-auth";
import { LoadingBlock } from "@/components/app/loading/LoadingUi";
import { useCallback, useEffect, useState } from "react";

export default function StaffPage() {
  const [authed, setAuthed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setAuthed(!!getStaffAccessToken());
    setReady(true);
  }, []);

  const onLoggedIn = useCallback(() => {
    setAuthed(true);
  }, []);

  const onSessionLost = useCallback(() => {
    setAuthed(false);
  }, []);

  if (!ready) {
    return <LoadingBlock label="Loading staff console…" />;
  }

  return (
    <>
      <header>
        <div className="logo">
          <BrandLogoMark size={28} /> {BRAND_NAME} staff
        </div>
      </header>
      <main>
        {authed ? (
          <StaffVendorQueue onSessionLost={onSessionLost} />
        ) : (
          <StaffLoginForm onLoggedIn={onLoggedIn} />
        )}
      </main>
    </>
  );
}