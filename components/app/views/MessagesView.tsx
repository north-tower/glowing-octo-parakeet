"use client";

import { useNakuruApp } from "@/components/app/AppProvider";
import { MSGS } from "@/lib/nakuru/data/constants";

export function MessagesView() {
  const { toast } = useNakuruApp();

  return (
    <>
      <h2 style={{ marginTop: 0 }}>Messages</h2>
      {MSGS.map((m, i) => (
        <div
          key={i}
          className="card li"
          role="button"
          tabIndex={0}
          onClick={() => toast("Chat opens here (in-app or WhatsApp)")}
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