"use client";

import type { StaffMe } from "@/lib/nakuru/staff-api";
import { createContext, useContext, type ReactNode } from "react";

type StaffSessionContextValue = {
  me: StaffMe;
  signOut: () => void;
};

const StaffSessionContext = createContext<StaffSessionContextValue | null>(
  null,
);

export function StaffSessionProvider({
  me,
  signOut,
  children,
}: StaffSessionContextValue & { children: ReactNode }) {
  return (
    <StaffSessionContext.Provider value={{ me, signOut }}>
      {children}
    </StaffSessionContext.Provider>
  );
}

export function useStaffSession(): StaffSessionContextValue {
  const ctx = useContext(StaffSessionContext);
  if (!ctx) {
    throw new Error("useStaffSession requires StaffSessionProvider");
  }
  return ctx;
}