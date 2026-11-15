"use client";

import { useEffect, type ReactNode } from "react";

/** Staff route uses marketplace chrome (`styles.css`), not landing body styles. */
export default function StaffBody({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.body.classList.remove("landing");
    return () => {
      document.body.classList.add("landing");
    };
  }, []);

  return children;
}