"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

const LEGACY_SCRIPT_ID = "nakuru-legacy-app";
const LEGACY_SCRIPT_SRC = "/legacy/app.js";

declare global {
  interface Window {
    __nakuruHubLegacy?: {
      remount: () => void;
    };
  }
}

function loadLegacyScript(): Promise<void> {
  if (window.__nakuruHubLegacy) {
    return Promise.resolve();
  }

  const existing = document.getElementById(
    LEGACY_SCRIPT_ID,
  ) as HTMLScriptElement | null;

  if (existing) {
    return new Promise((resolve, reject) => {
      if (window.__nakuruHubLegacy) {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Legacy app script failed to load")),
        { once: true },
      );
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.id = LEGACY_SCRIPT_ID;
    script.src = LEGACY_SCRIPT_SRC;
    script.async = false;
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener(
      "error",
      () => reject(new Error("Legacy app script failed to load")),
      { once: true },
    );
    document.body.appendChild(script);
  });
}

/**
 * Client-only bridge: preserves prototype `app.js` DOM ids and mounts legacy logic
 * after paint (Phase 2). No SSR markup beyond static shell placeholders.
 */
export default function LegacyAppMount() {
  const searchParams = useSearchParams();
  const vendorEntry =
    searchParams.get("start") === "vendor" || searchParams.has("vendor");

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        await loadLegacyScript();
        if (cancelled) return;
        window.__nakuruHubLegacy?.remount();
      } catch {
        // Script load failure: shell remains visible; Phase 3 replaces this bridge.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [vendorEntry]);

  return (
    <>
      <header id="hd">
        <div className="row sp">
          <span className="logo">🦩 NakuruHub</span>
          <select id="area" aria-label="Your area" defaultValue="" />
        </div>
        <div className="search">
          <span>🔍</span>
          <input
            id="q"
            placeholder="Search shops, homes, cars, services"
            defaultValue=""
          />
          <button id="cam" type="button" aria-label="Search by photo">
            📷
          </button>
          <button id="go" type="button" aria-label="Search">
            ⌕
          </button>
        </div>
        <div className="tabs" id="tabs" />
      </header>
      <main id="v" />
      <div id="sb" hidden>
        <span>Sign in to start your business</span>
        <button className="btn s" type="button" data-a="signin">
          Sign in
        </button>
      </div>
      <button
        className="fab"
        id="fab"
        type="button"
        data-a="tab"
        data-id="msg"
        aria-label="Chat"
      >
        💬
      </button>
      <nav id="nav" />
      <input
        type="file"
        id="pf"
        accept="image/jpeg,image/png,image/webp"
        hidden
      />
      <div id="toast" className="toast" role="status" aria-live="polite" hidden />
    </>
  );
}