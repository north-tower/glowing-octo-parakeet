"use client";

import {
  CategoryTilesSkeleton,
  ListingsSkeleton,
} from "@/components/app/catalog/ListingsStates";

type SpinnerSize = "sm" | "md" | "lg";

const SPIN_CLASS: Record<SpinnerSize, string> = {
  sm: "load-spin load-spin--sm",
  md: "load-spin",
  lg: "load-spin load-spin--lg",
};

export function LoadingSpinner({
  size = "md",
  label = "Loading",
}: {
  size?: SpinnerSize;
  label?: string;
}) {
  return (
    <span
      className={SPIN_CLASS[size]}
      role="status"
      aria-label={label}
    />
  );
}

export function LoadingBlock({
  label = "Loading…",
  compact,
}: {
  label?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`load-block${compact ? " load-block--compact" : ""}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <LoadingSpinner label={label} />
      <span className="load-block-label">{label}</span>
    </div>
  );
}

export function LoadingInline({ label = "Loading…" }: { label?: string }) {
  return (
    <p className="load-inline m" role="status" aria-live="polite" aria-busy="true">
      <LoadingSpinner size="sm" label={label} />
      <span>{label}</span>
    </p>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="pd" aria-busy="true" aria-label="Loading product">
      <div className="pd-skel pim" />
      <div className="pd-inner">
        <div className="pd-skel" style={{ height: 28, width: "70%" }} />
        <div className="pd-skel" style={{ height: 18, width: "40%" }} />
        <div
          className="pd-skel"
          style={{ height: 72, width: "100%", marginTop: 8 }}
        />
      </div>
    </div>
  );
}

export function CardRowsSkeleton({
  count = 3,
  className = "card-skel-list",
}: {
  count?: number;
  className?: string;
}) {
  return (
    <ul className={className} aria-busy="true" aria-label="Loading">
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className="card-skel" aria-hidden>
          <span className="card-skel-av" />
          <div className="card-skel-body">
            <span className="card-skel-line card-skel-line--title" />
            <span className="card-skel-line" />
            <span className="card-skel-line card-skel-line--short" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function EarningsSkeleton() {
  return (
    <div
      className="shop-earn-grid earn-skel"
      aria-busy="true"
      aria-label="Loading earnings"
    >
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="shop-earn-tile earn-skel-tile" aria-hidden>
          <span className="earn-skel-num" />
          <span className="earn-skel-lbl" />
        </div>
      ))}
    </div>
  );
}

export function CommentsSkeleton({ count = 2 }: { count?: number }) {
  return (
    <ul
      className="pd-comment-list comment-skel-list"
      aria-busy="true"
      aria-label="Loading comments"
    >
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className="comment-skel" aria-hidden>
          <div className="comment-skel-meta">
            <span className="comment-skel-pill" />
            <span className="comment-skel-pill comment-skel-pill--time" />
          </div>
          <span className="comment-skel-body" />
          <span className="comment-skel-body comment-skel-body--short" />
        </li>
      ))}
    </ul>
  );
}

export function VendorWorkspaceSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading vendor workspace">
      <CardRowsSkeleton count={2} />
      <div style={{ marginTop: 12 }}>
        <ListingsSkeleton count={2} className="g2" />
      </div>
    </div>
  );
}

export function AppShellLoading() {
  return (
    <div className="app-shell load-app-shell" aria-busy="true" aria-label="Loading">
      <div className="load-hd-skel" aria-hidden>
        <span className="load-hd-bar" />
        <span className="load-hd-search" />
      </div>
      <main id="v" className="load-app-main">
        <CategoryTilesSkeleton count={6} />
        <ListingsSkeleton count={4} className="g2" />
      </main>
    </div>
  );
}

export function ProductDetailShellLoading() {
  return (
    <div
      className="app-shell app-shell--detail"
      aria-busy="true"
      aria-label="Loading product"
    >
      <MotionSafeHeaderPlaceholder />
      <main id="v" className="pd-main">
        <ProductDetailSkeleton />
      </main>
    </div>
  );
}

function MotionSafeHeaderPlaceholder() {
  return <div className="load-hd-skel load-hd-skel--detail" aria-hidden />;
}