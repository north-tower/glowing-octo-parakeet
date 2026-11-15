"use client";

import { useCallback, useEffect, useState } from "react";

export function useLandingNav(navId = "site-nav", headerId = "site-header") {
  const [menuOpen, setMenuOpen] = useState(false);

  const setMenu = useCallback((open: boolean) => {
    const header = document.getElementById(headerId);
    const menuBtn = document.querySelector<HTMLButtonElement>(".nav-menu-btn");
    const nav = document.getElementById(navId);
    if (!header || !menuBtn || !nav) return;
    setMenuOpen(open);
    header.classList.toggle("nav-open", open);
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }, [headerId, navId]);

  const toggleMenu = useCallback(() => {
    setMenu(!menuOpen);
  }, [menuOpen, setMenu]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenu(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [setMenu]);

  useEffect(() => {
    const nav = document.getElementById(navId);
    if (!nav) return;

    const navLinks = nav.querySelectorAll<HTMLAnchorElement>("a[href^='#']");
    const sections: {
      link: HTMLAnchorElement;
      id: string;
      el: HTMLElement;
    }[] = [];

    navLinks.forEach((a) => {
      const id = a.getAttribute("href")?.slice(1) ?? "";
      const sec = document.getElementById(id);
      if (sec) sections.push({ link: a, id, el: sec });
      const closeOnNav = () => setMenu(false);
      a.addEventListener("click", closeOnNav);
    });

    function updateNavActive() {
      if (!sections.length) return;
      const y = window.scrollY || document.documentElement.scrollTop;
      if (y < 24) {
        sections.forEach((s) => s.link.classList.remove("is-active"));
        return;
      }
      const trigger = window.innerHeight * 0.35;
      let activeId = "";
      sections.forEach((s) => {
        const top = s.el.getBoundingClientRect().top;
        if (top <= trigger) activeId = s.id;
      });
      sections.forEach((s) => {
        s.link.classList.toggle("is-active", s.id === activeId);
      });
    }

    updateNavActive();
    window.addEventListener("scroll", updateNavActive, { passive: true });
    window.addEventListener("resize", updateNavActive);

    return () => {
      window.removeEventListener("scroll", updateNavActive);
      window.removeEventListener("resize", updateNavActive);
      navLinks.forEach((a) => {
        a.replaceWith(a.cloneNode(true));
      });
    };
  }, [navId, setMenu]);

  return { menuOpen, toggleMenu, setMenu };
}