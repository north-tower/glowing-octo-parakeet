"use client";

import { ApiError } from "@/lib/nakuru/api";
import type { ListingMode } from "@/lib/nakuru/types";
import {
  clearStaffAccessToken,
  getStaffAccessToken,
} from "@/lib/nakuru/staff-auth";
import { staffFetch, type StaffCategoryRow } from "@/lib/nakuru/staff-api";
import { CardRowsSkeleton } from "@/components/app/loading/LoadingUi";
import { useCallback, useEffect, useState, type FormEvent } from "react";

const MODES: ListingMode[] = ["shop", "services", "property", "cars"];

function patchErrorMessage(err: ApiError): string {
  const code = err.body.error;
  if (code === "not_found") return "Category not found.";
  if (code === "conflict") return "A category with that name already exists.";
  if (code === "bad_request") return "Invalid change.";
  return err.message;
}

export function StaffCategoryPanel() {
  const [rows, setRows] = useState<StaffCategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busySlug, setBusySlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [newLabel, setNewLabel] = useState("");
  const [newMode, setNewMode] = useState<ListingMode>("shop");
  const [newOpen, setNewOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    if (!getStaffAccessToken()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await staffFetch<StaffCategoryRow[]>("/api/admin/categories");
      setRows(data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        clearStaffAccessToken();
        window.location.reload();
        return;
      }
      setError(err instanceof ApiError ? err.message : "Could not load categories.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const patchRow = async (
    slug: string,
    patch: Partial<
      Pick<StaffCategoryRow, "visible" | "openForApply" | "listingMode">
    >,
  ) => {
    setBusySlug(slug);
    setError(null);
    setNotice(null);
    try {
      const updated = await staffFetch<StaffCategoryRow>(
        `/api/admin/categories/${encodeURIComponent(slug)}`,
        {
          method: "PATCH",
          body: JSON.stringify(patch),
        },
      );
      setRows((prev) =>
        prev.map((r) => (r.slug === slug ? { ...r, ...updated } : r)),
      );
      setNotice(`Updated ${slug}.`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        clearStaffAccessToken();
        window.location.reload();
        return;
      }
      setError(
        err instanceof ApiError ? patchErrorMessage(err) : "Update failed.",
      );
    } finally {
      setBusySlug(null);
    }
  };

  const createOfficial = async (ev: FormEvent) => {
    ev.preventDefault();
    const label = newLabel.trim();
    if (label.length < 2) {
      setError("Label must be at least 2 characters.");
      return;
    }
    setCreating(true);
    setError(null);
    setNotice(null);
    try {
      const row = await staffFetch<StaffCategoryRow>("/api/admin/categories", {
        method: "POST",
        body: JSON.stringify({
          label,
          listingMode: newMode,
          openForApply: newOpen,
        }),
      });
      setRows((prev) => [...prev, row].sort(sortCategories));
      setNewLabel("");
      setNewOpen(false);
      setNotice(`Added official category ${row.slug}.`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        clearStaffAccessToken();
        window.location.reload();
        return;
      }
      setError(
        err instanceof ApiError ? patchErrorMessage(err) : "Could not add category.",
      );
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <CardRowsSkeleton count={4} />;

  return (
    <>
      <h2 style={{ marginTop: 0 }}>Category directory</h2>
      <p className="m" style={{ marginTop: 0 }}>
        Hide a name to remove it from browse and apply. Official rows can open
        vendor waitlists. Community names stay visible unless hidden.
      </p>
      {error ? <div className="err">{error}</div> : null}
      {notice ? (
        <div className="card m" role="status">
          {notice}
        </div>
      ) : null}

      <form className="card staff-ops-cat-new" onSubmit={createOfficial}>
        <div className="t">Add official category</div>
        <label htmlFor="cat-new-label">Label</label>
        <input
          id="cat-new-label"
          type="text"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          maxLength={40}
          disabled={creating}
          required
        />
        <label htmlFor="cat-new-mode">Listing mode</label>
        <select
          id="cat-new-mode"
          value={newMode}
          onChange={(e) => setNewMode(e.target.value as ListingMode)}
          disabled={creating}
        >
          {MODES.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <label className="row" style={{ gap: 8, alignItems: "center", marginTop: 10 }}>
          <input
            type="checkbox"
            checked={newOpen}
            onChange={(e) => setNewOpen(e.target.checked)}
            disabled={creating}
          />
          Open for vendor apply
        </label>
        <button type="submit" className="btn s" style={{ marginTop: 10 }} disabled={creating}>
          {creating ? "Adding…" : "Add official"}
        </button>
      </form>

      {rows.length === 0 ? (
        <div className="card m">No categories in directory.</div>
      ) : (
        <div className="staff-ops-audit-table card" style={{ padding: 0, overflowX: "auto" }}>
          <table className="staff-ops-table staff-ops-cat-table">
            <thead>
              <tr>
                <th>Label</th>
                <th>Slug</th>
                <th>Kind</th>
                <th>Mode</th>
                <th>Visible</th>
                <th>Open apply</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const busy = busySlug === row.slug;
                const indent = row.depth > 0 ? { paddingLeft: `${8 + row.depth * 12}px` } : undefined;
                return (
                  <tr key={row.slug}>
                    <td style={indent}>
                      <span className="t" style={{ fontSize: 14 }}>
                        {row.label}
                      </span>
                      {row.parentSlug ? (
                        <div className="m" style={{ fontSize: 11 }}>
                          under {row.parentSlug}
                        </div>
                      ) : null}
                    </td>
                    <td>
                      <code style={{ fontSize: 12 }}>{row.slug}</code>
                    </td>
                    <td>{row.kind}</td>
                    <td>
                      <select
                        value={row.listingMode}
                        disabled={busy}
                        onChange={(e) =>
                          void patchRow(row.slug, {
                            listingMode: e.target.value as ListingMode,
                          })
                        }
                        aria-label={`Listing mode for ${row.label}`}
                      >
                        {MODES.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        checked={row.visible}
                        disabled={busy}
                        onChange={(e) =>
                          void patchRow(row.slug, { visible: e.target.checked })
                        }
                        aria-label={`Visible ${row.label}`}
                      />
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        checked={row.openForApply}
                        disabled={busy || row.kind === "community"}
                        title={
                          row.kind === "community"
                            ? "Community names are always open when visible"
                            : undefined
                        }
                        onChange={(e) =>
                          void patchRow(row.slug, {
                            openForApply: e.target.checked,
                          })
                        }
                        aria-label={`Open for apply ${row.label}`}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <button
        type="button"
        className="btn s o"
        style={{ marginTop: 12 }}
        onClick={() => void load()}
      >
        Refresh
      </button>
    </>
  );
}

function sortCategories(a: StaffCategoryRow, b: StaffCategoryRow): number {
  if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
  return a.label.localeCompare(b.label);
}