"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ListingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="app-shell app-shell--detail">
      <main id="v" className="pd-main">
        <div className="pd">
          <div className="pd-inner">
            <div className="card pd-card">
              <p className="t">Couldn’t load this listing</p>
              <p className="m">Check your connection and try again.</p>
              <button
                type="button"
                className="btn full"
                style={{ marginTop: 12 }}
                onClick={reset}
              >
                Try again
              </button>
              <Link href="/app" className="btn o full" style={{ marginTop: 8 }}>
                Browse marketplace
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
