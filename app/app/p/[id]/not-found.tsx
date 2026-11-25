import Link from "next/link";

export default function ListingNotFound() {
  return (
    <div className="app-shell app-shell--detail">
      <main id="v" className="pd-main">
        <div className="pd">
          <div className="pd-inner">
            <div className="card pd-card">
              <p className="t">This listing was removed</p>
              <p className="m">
                It may have sold out or the seller unpublished it.
              </p>
              <Link href="/app" className="btn o full" style={{ marginTop: 12 }}>
                Browse marketplace
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
