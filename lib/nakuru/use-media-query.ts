"use client";

import { useEffect, useState } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const apply = () => setMatches(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [query]);

  return matches;
}

export function useAppTabletUp(): boolean {
  return useMediaQuery("(min-width: 768px)");
}

export function useAppDesktopUp(): boolean {
  return useMediaQuery("(min-width: 1024px)");
}