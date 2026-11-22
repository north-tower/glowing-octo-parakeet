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

export function ListingsSkeleton({
  count = 4,
  className = "g2",
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={className} aria-busy="true" aria-label="Loading listings">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="pc pc-skel" aria-hidden>
          <div className="pim pim--ratio-1" />
          <div className="pc-body">
            <div className="pc-title">…</div>
            <div className="pc-price">
              <span className="pc-price-kes">KES</span>
              <span className="pc-price-num">—</span>
            </div>
          </div>
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