"use client";

import { useState } from "react";
import { usePwaInstall } from "@/components/app/pwa/InstallProvider";
import { homeCopy } from "@/lib/nakuru/home-i18n";
import { MSGS } from "@/lib/nakuru/data/constants";

export function MessagesView() {
  const { lang } = usePwaInstall();
  const [thread, setThread] = useState<number | null>(null);

  if (thread !== null) {
    const m = MSGS[thread]!;
    return (
      <div className="msg-thread">
        <button
          type="button"
          className="btn s o"
          onClick={() => setThread(null)}
        >
          ‹ {homeCopy("navMessage", lang)}
        </button>
        <h2 style={{ marginTop: 8 }}>{m[1]}</h2>
        <div className="card" style={{ marginTop: 12 }}>
          <p className="m">{m[2]}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <h2 style={{ marginTop: 0 }}>{homeCopy("navMessage", lang)}</h2>
      {MSGS.map((m, i) => (
        <div
          key={i}
          className="card li"
          role="button"
          tabIndex={0}
          onClick={() => setThread(i)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setThread(i);
          }}
        >
          <div className="av">{m[0]}</div>
          <div style={{ flex: 1 }}>
            <div className="t">{m[1]}</div>
            <div className="m">{m[2]}</div>
          </div>
          <span className="m">{m[3]}</span>
        </div>
      ))}
    </>
  );
}