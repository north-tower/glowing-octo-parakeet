"use client";

import { useLayoutEffect, type ReactNode } from "react";

/** Auth routes use marketplace background tokens without full app chrome. */
export default function AuthBody({ children }: { children: ReactNode }) {
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