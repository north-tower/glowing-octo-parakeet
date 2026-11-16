"use client";

export function CategoryTilesSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      className="home-cat-grid"
      aria-busy="true"
      aria-label="Loading categories"
    >
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="ct ct-skeleton" aria-hidden>
          <span className="ct-icon" />
          <span className="ct-label" />
        </div>
      ))}
    </div>
  );
}

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