export function ListingCardSkeleton() {
  return (
    <div className="lc lc-skel-card" aria-hidden>
      <div className="lc-media">
        <span className="lc-skel" />
      </div>
      <div className="lc-body">
        <span className="lc-skel-line lc-skel-line--price" />
        <span className="lc-skel-line" />
        <span className="lc-skel-line lc-skel-line--short" />
        <span className="lc-skel-line lc-skel-line--chip" />
      </div>
    </div>
  );
}
