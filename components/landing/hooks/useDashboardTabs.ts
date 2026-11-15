"use client";

import { useEffect } from "react";

type DashTab = "products" | "orders" | "verified";

export function useDashboardTabs(): void {
  useEffect(() => {
    const root = document.querySelector("[data-dash-root]");
    if (!root) return;

    const tabs = root.querySelectorAll<HTMLButtonElement>("[data-dash-tab]");
    const panels = root.querySelectorAll<HTMLElement>("[data-dash-panel]");
    const panelsWrap = document.getElementById("dash-panels");
    const tabOrder: DashTab[] = ["products", "orders", "verified"];
    let current: DashTab = "orders";
    const motionOk = !window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches;

    document.body.classList.add("js-dashboard-demo");

    panels.forEach((panel) => panel.removeAttribute("hidden"));

    function setPanel(next: DashTab) {
      if (!panels.length || next === current) return;
      current = next;
      tabs.forEach((tab) => {
        const on = tab.getAttribute("data-dash-tab") === next;
        tab.setAttribute("aria-selected", on ? "true" : "false");
        tab.setAttribute("tabindex", on ? "0" : "-1");
      });
      panels.forEach((panel) => {
        const on = panel.getAttribute("data-dash-panel") === next;
        panel.classList.toggle("is-active", on);
        panel.setAttribute("aria-hidden", on ? "false" : "true");
      });
    }

    function measurePanels() {
      if (!panelsWrap) return;
      let maxH = 0;
      panels.forEach((panel) => {
        panel.classList.add("dash-measure");
        const h = panel.scrollHeight;
        if (h > maxH) maxH = h;
        panel.classList.remove("dash-measure");
      });
      if (maxH > 0)
        panelsWrap.style.setProperty("--dash-panels-h", `${maxH}px`);
    }

    const onTabClick = (tab: HTMLButtonElement) => {
      setPanel(tab.getAttribute("data-dash-tab") as DashTab);
    };

    const onTabKey = (tab: HTMLButtonElement, e: KeyboardEvent) => {
      if (
        e.key !== "ArrowLeft" &&
        e.key !== "ArrowRight" &&
        e.key !== "ArrowUp" &&
        e.key !== "ArrowDown"
      )
        return;
      e.preventDefault();
      let idx = tabOrder.indexOf(current);
      if (e.key === "ArrowRight" || e.key === "ArrowDown")
        idx = (idx + 1) % tabOrder.length;
      else idx = (idx - 1 + tabOrder.length) % tabOrder.length;
      const target = root.querySelector<HTMLButtonElement>(
        `[data-dash-tab="${tabOrder[idx]}"]`,
      );
      if (target) {
        target.focus();
        setPanel(tabOrder[idx]);
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

    measurePanels();
    const onResize = () => measurePanels();
    window.addEventListener("resize", onResize, { passive: true });
    setPanel("orders");

    if (!motionOk && panelsWrap) panelsWrap.classList.add("dash-panels--reduced");

    return () => {
      cleanups.forEach((fn) => fn());
      window.removeEventListener("resize", onResize);
      document.body.classList.remove("js-dashboard-demo");
    };
  }, []);
}