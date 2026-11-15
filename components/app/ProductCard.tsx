"use client";

import { ACT } from "@/lib/nakuru/data/constants";
import { kes } from "@/lib/nakuru/format";
import type { Listing } from "@/lib/nakuru/types";

type Props = {
  item: Listing;
  onAct: (id: number) => void;
};

export function ProductCard({ item, onAct }: Props) {
  return (
    <div className="pc">
      <div className="pim">{item.e}</div>
      <div className="t">{item.t}</div>
      <div className="m">{item.s}</div>
      <div className="pr">{kes(item.p)}</div>
      <div>
        <span className={`badge ${item.v ? "" : "u"}`}>
          {item.v ? "✓ Verified" : "Unverified"}
        </span>
      </div>
      <button
        type="button"
        className="btn s"
        onClick={() => onAct(item.id)}
      >
        {ACT[item.c]}
      </button>
    </div>
  );
}