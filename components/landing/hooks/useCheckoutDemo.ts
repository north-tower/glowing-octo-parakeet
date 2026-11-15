"use client";

import { useEffect } from "react";
import { useLandingLang } from "@/components/landing/LandingLangContext";

type CheckoutTab = "verified" | "unverified";

export function useCheckoutDemo(): void {
  const { lang } = useLandingLang();

  useEffect(() => {
    const root = document.querySelector("[data-checkout-states]");
    if (!root) return;

    const tabs = document.querySelectorAll<HTMLButtonElement>(
      "[data-checkout-tab]",
    );
    const states = root.querySelectorAll<HTMLElement>("[data-checkout-state]");
    const floatChip = document.getElementById("checkout-float-chip");
    const live = document.getElementById("checkout-live");
    const panel = document.getElementById("checkout-phone-panel");
    const segment = document.querySelector<HTMLElement>(".checkout-segment");
    const motionOk = !window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches;

    let current: CheckoutTab = "verified";
    let cycleTimer: ReturnType<typeof setInterval> | null = null;
    let userTouched = false;

    document.body.classList.add("js-checkout-demo");
    if (segment) segment.hidden = false;

    const annEn: Record<CheckoutTab, string> = {
      verified: "Verified checkout — M-Pesa now available.",
      unverified: "Unverified checkout — M-Pesa now unavailable.",
    };
    const annSw: Record<CheckoutTab, string> = {
      verified: "Malipo Verified — M-Pesa sasa inapatikana.",
      unverified: "Malipo bila uthibitisho — M-Pesa sasa haipatikani.",
    };

    function announce() {
      if (!live) return;
      const l = document.documentElement.lang === "sw" ? "sw" : "en";
      live.textContent = (l === "sw" ? annSw : annEn)[current] ?? "";
    }

    function setState(next: CheckoutTab, fromUser: boolean) {
      if (!states.length || next === current) return;
      current = next;
      if (fromUser) userTouched = true;
      tabs.forEach((tab) => {
        const on = tab.getAttribute("data-checkout-tab") === next;
        tab.setAttribute("aria-selected", on ? "true" : "false");
        tab.setAttribute("tabindex", on ? "0" : "-1");
      });
      if (panel) {
        panel.setAttribute(
          "aria-labelledby",
          next === "verified"
            ? "checkout-tab-verified"
            : "checkout-tab-unverified",
        );
      }
      states.forEach((state) => {
        const on = state.getAttribute("data-checkout-state") === next;
        state.classList.toggle("is-active", on);
        state.removeAttribute("hidden");
        state.setAttribute("aria-hidden", on ? "false" : "true");
      });
      if (floatChip) floatChip.classList.toggle("is-hidden", next !== "verified");
      announce();
      if (userTouched && cycleTimer) {
        clearInterval(cycleTimer);
        cycleTimer = null;
      }
    }

    function startCycle() {
      if (!motionOk || userTouched) return;
      cycleTimer = setInterval(() => {
        setState(current === "verified" ? "unverified" : "verified", false);
      }, 5000);
    }

    states.forEach((state) => state.removeAttribute("hidden"));

    const onTabClick = (tab: HTMLButtonElement) => {
      const v = tab.getAttribute("data-checkout-tab") as CheckoutTab;
      setState(v, true);
    };

    const onTabKey = (tab: HTMLButtonElement, e: KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();
      const order: CheckoutTab[] = ["unverified", "verified"];
      let idx = order.indexOf(current);
      if (e.key === "ArrowRight") idx = (idx + 1) % order.length;
      else idx = (idx - 1 + order.length) % order.length;
      const target = document.querySelector<HTMLButtonElement>(
        `[data-checkout-tab="${order[idx]}"]`,
      );
      if (target) {
        target.focus();
        setState(order[idx], true);
      }
    };

    const cleanups: (() => void)[] = [];
    tabs.forEach((tab) => {
      const click = () => onTabClick(tab);
      const key = (e: KeyboardEvent) => onTabKey(tab, e);
      tab.addEventListener("click", click);
      tab.addEventListener("keydown", key);
      cleanups.push(() => {
        tab.removeEventListener("click", click);
        tab.removeEventListener("keydown", key);
      });
    });

    const onPointer = () => {
      userTouched = true;
    };
    root.addEventListener("pointerdown", onPointer, { once: true });

    announce();
    startCycle();

    return () => {
      cleanups.forEach((fn) => fn());
      if (cycleTimer) clearInterval(cycleTimer);
      root.removeEventListener("pointerdown", onPointer);
      document.body.classList.remove("js-checkout-demo");
    };
  }, []);

  useEffect(() => {
    const live = document.getElementById("checkout-live");
    if (!live) return;
    const current =
      document
        .querySelector("[data-checkout-tab][aria-selected='true']")
        ?.getAttribute("data-checkout-tab") ?? "verified";
    const annEn: Record<string, string> = {
      verified: "Verified checkout — M-Pesa now available.",
      unverified: "Unverified checkout — M-Pesa now unavailable.",
    };
    const annSw: Record<string, string> = {
      verified: "Malipo Verified — M-Pesa sasa inapatikana.",
      unverified: "Malipo bila uthibitisho — M-Pesa sasa haipatikani.",
    };
    const table = lang === "sw" ? annSw : annEn;
    live.textContent = table[current] ?? "";
  }, [lang]);
}