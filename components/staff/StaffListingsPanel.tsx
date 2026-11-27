"use client";

import { ApiError } from "@/lib/nakuru/api";
import { kes } from "@/lib/nakuru/format";
import {
  clearStaffAccessToken,
  getStaffAccessToken,
} from "@/lib/nakuru/staff-auth";
import {
  staffFetch,
  type StaffListingRow,
  type StaffListingsPage,
} from "@/lib/nakuru/staff-api";
import { CardRowsSkeleton } from "@/components/app/loading/LoadingUi";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useStaffSession } from "./StaffSessionContext";

type ActiveFilter = "all" | "active" | "inactive";
type VendorFilter = "all" | "pending" | "approved" | "rejected";
type CatalogFilter = "all" | "public" | "hidden";

function formatWhen(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-KE", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function buildQuery(
  active: ActiveFilter,
  vendor: VendorFilter,
): URLSearchParams {
  const p = new URLSearchParams({ limit: "50" });
  if (active === "active") p.set("active", "true");
  else if (active === "inactive") p.set("active", "false");
  else p.set("active", "all");
  if (vendor !== "all") p.set("vendorStatus", vendor);
  return p;
}

export function StaffListingsPanel() {
  const { me } = useStaffSession();
  const isAdmin = me.role === "admin";
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");
  const [vendorFilter, setVendorFilter] = useState<VendorFilter>("all");
  const [catalogFilter, setCatalogFilter] = useState<CatalogFilter>("all");
  const [rows, setRows] = useState<StaffListingRow[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchPage = useCallback(
    async (opts: { cursor?: string | null; append: boolean }) => {
      if (!getStaffAccessToken()) return;
      const q = buildQuery(activeFilter, vendorFilter);
      if (opts.cursor) q.set("cursor", opts.cursor);

      if (opts.append) setLoadingMore(true);
      else setLoading(true);
      setError(null);

      try {
        const page = await staffFetch<StaffListingsPage>(
          `/api/admin/listings?${q.toString()}`,
        );
        setRows((prev) => (opts.append ? [...prev, ...page.rows] : page.rows));
        setNextCursor(page.nextCursor);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          clearStaffAccessToken();
          window.location.reload();
          return;
        }
        setError(
          err instanceof ApiError ? err.message : "Could not load listings.",
        );
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [activeFilter, vendorFilter],
  );

  useEffect(() => {
    void fetchPage({ append: false });
  }, [fetchPage]);

  const q = search.trim().toLowerCase();
  let visible = rows;
  if (q) {
    visible = visible.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.vendorName.toLowerCase().includes(q) ||
        r.categoryLabel.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q),
    );
  }
  if (catalogFilter === "public") {
    visible = visible.filter((r) => r.onPublicCatalog);
  } else if (catalogFilter === "hidden") {
    visible = visible.filter((r) => !r.onPublicCatalog);
  }

  if (loading) return <CardRowsSkeleton count={5} />;

  return (
    <>
      <h2 style={{ marginTop: 0 }}>Listings</h2>
      <p className="m" style={{ marginTop: 0 }}>
        Every product row in the database, including inactive listings and shops
        still pending approval. <strong>On storefront</strong> matches public
        catalog rules.
        {isAdmin
          ? " Admins can delete a listing unless it is already on an order."
          : ""}
      </p>

      <div className="m" style={{ marginBottom: 6 }}>
        Active
      </div>
      <div className="row" style={{ flexWrap: "wrap", marginBottom: 10, gap: 6 }}>
        {(
          [
            ["all", "All"],
            ["active", "Active only"],
            ["inactive", "Inactive"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={`chip${activeFilter === key ? " on" : ""}`}
            onClick={() => setActiveFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="m" style={{ marginBottom: 6 }}>
        Vendor status
      </div>
      <div className="row" style={{ flexWrap: "wrap", marginBottom: 10, gap: 6 }}>
        {(
          [
            ["all", "All"],
            ["approved", "Approved"],
            ["pending", "Pending"],
            ["rejected", "Rejected"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={`chip${vendorFilter === key ? " on" : ""}`}
            onClick={() => setVendorFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="m" style={{ marginBottom: 6 }}>
        Storefront visibility (this page)
      </div>
      <div className="row" style={{ flexWrap: "wrap", marginBottom: 10, gap: 6 }}>
        {(
          [
            ["all", "All loaded"],
            ["public", "On storefront"],
            ["hidden", "Not public"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={`chip${catalogFilter === key ? " on" : ""}`}
            onClick={() => setCatalogFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <label htmlFor="listing-search">Search loaded rows</label>
      <input
        id="listing-search"
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Title, vendor, category, ID…"
        style={{ marginBottom: 10 }}
      />

      {error ? <div className="err">{error}</div> : null}

      {visible.length === 0 ? (
        <div className="card m">
          {rows.length === 0
            ? "No listings match server filters."
            : "Nothing matches your search or storefront filter."}
        </div>
      ) : (
        visible.map((row) => (
          <ListingCard
            key={row.id}
            row={row}
            canPromoteHero={isAdmin}
            canDelete={isAdmin}
            onDeleted={(id) =>
              setRows((prev) => prev.filter((r) => r.id !== id))
            }
          />
        ))
      )}

      {nextCursor ? (
        <button
          type="button"
          className="btn s"
          style={{ marginTop: 12 }}
          disabled={loadingMore}
          onClick={() => void fetchPage({ cursor: nextCursor, append: true })}
        >
          {loadingMore ? "Loading…" : "Load more"}
        </button>
      ) : null}
    </>
  );
}

function ListingCard({
  row,
  canPromoteHero,
  canDelete,
  onDeleted,
}: {
  row: StaffListingRow;
  canPromoteHero: boolean;
  canDelete: boolean;
  onDeleted: (id: string) => void;
}) {
  const stock =
    row.stock == null ? "Unlimited" : row.stock === 0 ? "Out of stock" : row.stock;
  const [heroBusy, setHeroBusy] = useState(false);
  const [heroMsg, setHeroMsg] = useState<string | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState<string | null>(null);

  const promoteHero = async () => {
    if (!getStaffAccessToken()) return;
    setHeroBusy(true);
    setHeroMsg(null);
    try {
      await staffFetch("/api/admin/home-placements", {
        method: "POST",
        body: JSON.stringify({
          productId: row.id,
          sortOrder: 1,
          headline: row.vendorName,
          subtitle: row.title,
          active: true,
        }),
      });
      setHeroMsg("Added to home hero carousel.");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        clearStaffAccessToken();
        window.location.reload();
        return;
      }
      const code =
        err instanceof ApiError ? String(err.message) : "Could not promote.";
      setHeroMsg(
        err instanceof ApiError && err.status === 409
          ? "Already on hero carousel — edit on Hero carousel page."
          : code,
      );
    } finally {
      setHeroBusy(false);
    }
  };

  const removeListing = async () => {
    if (!getStaffAccessToken()) return;
    const ok = window.confirm(
      `Delete “${row.title}”? This cannot be undone. Listings that appear on orders cannot be deleted.`,
    );
    if (!ok) return;
    setDeleteBusy(true);
    setDeleteMsg(null);
    try {
      await staffFetch(`/api/admin/listings/${row.id}`, { method: "DELETE" });
      onDeleted(row.id);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        clearStaffAccessToken();
        window.location.reload();
        return;
      }
      if (err instanceof ApiError && err.status === 409) {
        setDeleteMsg(
          "This listing is on an order, so it cannot be deleted. Hide it from the vendor shop instead, or leave it inactive.",
        );
        return;
      }
      setDeleteMsg(
        err instanceof ApiError ? err.message : "Could not delete listing.",
      );
    } finally {
      setDeleteBusy(false);
    }
  };

  return (
    <div className="card staff-ops-order-card">
      <div className="row sp" style={{ flexWrap: "wrap", gap: 8 }}>
        <div>
          <div className="t">{row.title}</div>
          <div className="m">
            {formatWhen(row.createdAt)} · {kes(row.priceKes)}
          </div>
        </div>
        <div className="m" style={{ textAlign: "right" }}>
          {row.onPublicCatalog ? (
            <span className="staff-ops-badge staff-ops-badge-ok">On storefront</span>
          ) : (
            <span className="staff-ops-badge">Not public</span>
          )}
        </div>
      </div>
      <div className="m" style={{ marginTop: 6 }}>
        {row.categoryLabel} ({row.category}) · {row.listingMode}
        {!row.categoryVisible ? " · hidden category" : ""}
      </div>
      <div className="m">
        Vendor: <strong>{row.vendorName}</strong> · {row.vendorStatus}
        {!row.active ? " · inactive listing" : ""}
        {` · Stock: ${stock}`}
      </div>
      <div className="row" style={{ gap: 8, flexWrap: "wrap", marginTop: 8 }}>
        {row.onPublicCatalog ? (
          <Link href={`/app/p/${row.id}`} className="btn s">
            Open listing
          </Link>
        ) : null}
        {canPromoteHero && row.onPublicCatalog ? (
          <button
            type="button"
            className="btn s o"
            disabled={heroBusy}
            onClick={() => void promoteHero()}
          >
            {heroBusy ? "Adding…" : "Add to hero carousel"}
          </button>
        ) : null}
        {canPromoteHero ? (
          <Link href="/staff/promotions" className="btn s o">
            Hero carousel
          </Link>
        ) : null}
        {canDelete ? (
          <button
            type="button"
            className="btn s o"
            disabled={deleteBusy}
            onClick={() => void removeListing()}
          >
            {deleteBusy ? "Deleting…" : "Delete listing"}
          </button>
        ) : null}
        <code style={{ fontSize: 11, wordBreak: "break-all", alignSelf: "center" }}>
          {row.id}
        </code>
      </div>
      {heroMsg ? (
        <div className="m" style={{ marginTop: 8 }}>
          {heroMsg}
        </div>
      ) : null}
      {deleteMsg ? (
        <div className="err" style={{ marginTop: 8 }}>
          {deleteMsg}
        </div>
      ) : null}
    </div>
  );
}