"use client";

import { useEffect, type ReactNode } from "react";

/** Marketplace shell uses `styles.css` app chrome, not landing body styles. */
export default function NakuruAppBody({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.body.classList.remove("landing");
    return () => {
      document.body.classList.add("landing");
    };
  }, []);

  return children;
}