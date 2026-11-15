"use client";

import { StaffLoginForm } from "@/components/staff/StaffLoginForm";
import { StaffVendorQueue } from "@/components/staff/StaffVendorQueue";
import { getStaffAccessToken } from "@/lib/nakuru/staff-auth";
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
    return null;
  }

  return (
  <>
      <header>
        <div className="logo">NakuruHub staff</div>
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