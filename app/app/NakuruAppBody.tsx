"use client";

import { useLayoutEffect, type ReactNode } from "react";

/** Marketplace shell uses `styles.css` app chrome, not landing body styles. */
export default function NakuruAppBody({ children }: { children: ReactNode }) {
  useLayoutEffect(() => {
    document.body.classList.remove("landing");
    document.body.classList.add("app");
    return () => {
      document.body.classList.remove("app");
      document.body.classList.add("landing");
    };
  }, []);

  return children;
}