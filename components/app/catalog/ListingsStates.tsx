"use client";

export function ListingsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="g2" aria-busy="true" aria-label="Loading listings">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="pc" style={{ opacity: 0.45 }}>
          <div className="pim">⋯</div>
          <div className="t">Loading…</div>
          <div className="m" />
          <div className="pr">—</div>
        </div>
      ))}
    </div>
  );
}

export function ListingsEmpty() {
  return (
    <div className="m">
      No listings yet. Approved vendors are adding products — check back soon.
    </div>
  );
}