"use client";

import {
  useCallback,
  useEffect,
  useState,
  type RefCallback,
  type RefObject,
} from "react";

const ROOT = () => document.documentElement;

function measureAndSet(el: HTMLElement) {
  const h = el.getBoundingClientRect().height;
  ROOT().style.setProperty("--sticky-bar-h", `${h}px`);
}

function resetStickyBar() {
  ROOT().style.setProperty("--sticky-bar-h", "0px");
}

/**
 * Observes a fixed action bar and publishes its height as `--sticky-bar-h` on
 * `:root`. Returns a callback ref — attach it to the bar so measurement runs
 * when the bar mounts (e.g. after async product load).
 */
export function useStickyBar<T extends HTMLElement = HTMLElement>(
  ref?: RefObject<T | null>,
): RefCallback<T> {
  const [node, setNode] = useState<T | null>(null);

  const setRef = useCallback<RefCallback<T>>(
    (el) => {
      if (ref) ref.current = el;
      setNode(el);
    },
    [ref],
  );

  useEffect(() => {
    if (!node) {
      ROOT().removeAttribute("data-sticky-bar");
      resetStickyBar();
      return () => {
        ROOT().removeAttribute("data-sticky-bar");
        resetStickyBar();
      };
    }

    ROOT().setAttribute("data-sticky-bar", "1");

    const apply = () => measureAndSet(node);
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(node);
    window.addEventListener("resize", apply);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", apply);
      ROOT().removeAttribute("data-sticky-bar");
      resetStickyBar();
    };
  }, [node]);

  return setRef;
}