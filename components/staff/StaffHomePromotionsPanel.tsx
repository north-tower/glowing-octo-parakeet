"use client";

import { ApiError } from "@/lib/nakuru/api";
import {
  clearStaffAccessToken,
  getStaffAccessToken,
} from "@/lib/nakuru/staff-auth";
import {
  staffFetch,
  type StaffHomePlacement,
} from "@/lib/nakuru/staff-api";
import { CardRowsSkeleton } from "@/components/app/loading/LoadingUi";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

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

type PlacementsPage = { rows: StaffHomePlacement[] };

export function StaffHomePromotionsPanel() {
  const [rows, setRows] = useState<StaffHomePlacement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!getStaffAccessToken()) return;
    setLoading(true);
    setError(null);
    try {
      const page = await staffFetch<PlacementsPage>("/api/admin/home-placements");
      setRows(page.rows);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        clearStaffAccessToken();
        window.location.reload();
        return;
      }
      setError(
        err instanceof ApiError ? err.message : "Could not load hero placements.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const patchRow = async (
    id: string,
    body: Record<string, unknown>,
  ): Promise<void> => {
    setBusyId(id);
    setError(null);
    try {
      const updated = await staffFetch<StaffHomePlacement>(
        `/api/admin/home-placements/${id}`,
        { method: "PATCH", body: JSON.stringify(body) },
      );
      setRows((prev) => prev.map((r) => (r.id === id ? updated : r)));
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        clearStaffAccessToken();
        window.location.reload();
        return;
      }
      setError(
        err instanceof ApiError ? err.message : "Could not update placement.",
      );
    } finally {
      setBusyId(null);
    }
  };

  const removeRow = async (id: string) => {
    if (!window.confirm("Remove this listing from the home hero carousel?")) return;
    setBusyId(id);
    setError(null);
    try {
      await staffFetch(`/api/admin/home-placements/${id}`, { method: "DELETE" });
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        clearStaffAccessToken();
        window.location.reload();
        return;
      }
      setError(
        err instanceof ApiError ? err.message : "Could not delete placement.",
      );
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <CardRowsSkeleton count={4} />;

  return (
    <>
      <h2 style={{ marginTop: 0 }}>Hero carousel</h2>
      <p className="m" style={{ marginTop: 0 }}>
        Vendor spotlights appear in the home hero after the first platform slide.
        Listings must be on the public storefront. Add placements from{" "}
        <Link href="/staff/listings">Listings</Link> or edit them here.
      </p>
      {error ? (
        <div className="err" style={{ marginBottom: 12 }}>
          {error}
        </div>
      ) : null}
      {rows.length === 0 ? (
        <div className="card m">No hero placements yet.</div>
      ) : (
        rows.map((row) => (
          <div key={row.id} className="card staff-ops-order-card">
            <div className="row sp" style={{ flexWrap: "wrap", gap: 8 }}>
              <div>
                <div className="t">{row.productTitle}</div>
                <div className="m">
                  {row.vendorName} · sort {row.sortOrder} · updated{" "}
                  {formatWhen(row.updatedAt)}
                </div>
              </div>
              <div className="m" style={{ textAlign: "right" }}>
                {row.active ? (
                  <span className="staff-ops-badge staff-ops-badge-ok">Live</span>
                ) : (
                  <span className="staff-ops-badge">Paused</span>
                )}
                {!row.onPublicCatalog ? (
                  <span className="staff-ops-badge" style={{ marginLeft: 6 }}>
                    Not on storefront
                  </span>
                ) : null}
              </div>
            </div>
            <div className="m" style={{ marginTop: 6 }}>
              {row.headline ? (
                <>
                  Headline: <strong>{row.headline}</strong>
                  <br />
                </>
              ) : null}
              {row.subtitle ? <>Subtitle: {row.subtitle}</> : null}
            </div>
            <PlacementTools
              row={row}
              busy={busyId === row.id}
              onToggleActive={() => patchRow(row.id, { active: !row.active })}
              onSort={(sortOrder: number) => patchRow(row.id, { sortOrder })}
              onRemove={() => void removeRow(row.id)}
            />
          </div>
        ))
      )}
    </>
  );
}

function PlacementTools({
  row,
  busy,
  onToggleActive,
  onSort,
  onRemove,
}: {
  row: StaffHomePlacement;
  busy: boolean;
  onToggleActive: () => void;
  onSort: (n: number) => void;
  onRemove: () => void;
}) {
  const [sortDraft, setSortDraft] = useState(String(row.sortOrder));

  return (
    <div className="row" style={{ gap: 8, flexWrap: "wrap", marginTop: 8 }}>
      <Link href={`/app/p/${row.productId}`} className="btn s">
        Preview listing
      </Link>
      <button
        type="button"
        className="btn s"
        disabled={busy}
        onClick={onToggleActive}
      >
        {row.active ? "Pause" : "Activate"}
      </button>
      <label className="m row" style={{ gap: 6, alignItems: "center" }}>
        Sort
        <input
          type="number"
          min={0}
          max={9999}
          value={sortDraft}
          onChange={(e) => setSortDraft(e.target.value)}
          style={{ width: 72 }}
          disabled={busy}
        />
        <button
          type="button"
          className="btn s o"
          disabled={busy}
          onClick={() => {
            const n = Number.parseInt(sortDraft, 10);
            if (Number.isFinite(n)) onSort(n);
          }}
        >
          Save
        </button>
      </label>
      <button
        type="button"
        className="btn s o"
        disabled={busy}
        onClick={onRemove}
      >
        Remove
      </button>
    </div>
  );
}