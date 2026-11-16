"use client";

import { ACT } from "@/lib/nakuru/data/constants";
import { isLiveCatalogEnabled } from "@/lib/nakuru/catalog-live";
import { kes } from "@/lib/nakuru/format";
import type { Listing } from "@/lib/nakuru/types";

type Props = {
  item: Listing;
  onAct: (id: number | string) => void;
  /** When true, service listings use the inquiry flow (Task 18). */
  serviceInquiryEnabled?: boolean;
};

export function ProductCard({
  item,
  onAct,
  serviceInquiryEnabled = false,
}: Props) {
  const live = isLiveCatalogEnabled();
  const serviceHeld =
    live && item.c === "services" && !serviceInquiryEnabled;
  const label = serviceHeld ? "Quote — coming soon" : ACT[item.c];

  return (
    <div className="pc">
      <div className="pim">
        {item.img ? (
          <img src={item.img} alt="" />
        ) : (
          <span aria-hidden>{item.e}</span>
        )}
      </div>
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
        disabled={serviceHeld}
        title={
          serviceHeld
            ? "Service quote requests open in the next release"
            : undefined
        }
        onClick={() => onAct(item.id)}
      >
        {label}
      </button>
    </div>
  );
}