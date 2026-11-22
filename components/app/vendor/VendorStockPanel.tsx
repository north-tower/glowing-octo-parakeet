"use client";

import { apiFetch, ApiError } from "@/lib/nakuru/api";
import type { DirectoryCategory } from "@/lib/nakuru/data/category-directory";
import type { ListingMode } from "@/lib/nakuru/types";
import { useCategories } from "@/lib/nakuru/use-categories";
import { useCallback, useEffect, useState } from "react";

export type VendorProductRow = {
  id: string;
  category: string;
  title: string;
  emoji: string;
  price: number;
  stock: number | null;
  active: boolean;
};

function directoryLabel(slug: string, rows: DirectoryCategory[]): string {
  return rows.find((r) => r.slug === slug)?.label ?? slug;
}

function listingModeForSlug(
  slug: string,
  rows: DirectoryCategory[],
): ListingMode {
  return rows.find((r) => r.slug === slug)?.listingMode ?? "shop";
}

type Props = {
  toast: (msg: string) => void;
  reloadToken?: number;
};

export function VendorStockPanel({ toast, reloadToken = 0 }: Props) {
  const { rows: directoryRows } = useCategories();
  const [listings, setListings] = useState<VendorProductRow[] | null>(null);
  const [listError, setListError] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCategory, setEditCategory] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [editStock, setEditStock] = useState("");
  const [editBusy, setEditBusy] = useState(false);

  const loadListings = useCallback(async () => {
    try {
      const data = await apiFetch<VendorProductRow[]>("/api/vendor/products");
      setListings(data);
      setListError(false);
    } catch {
      setListError(true);
      setListings([]);
    }
  }, []);

  useEffect(() => {
    void loadListings();
  }, [loadListings, reloadToken]);

  const startEdit = (row: VendorProductRow) => {
    setEditingId(row.id);
    setEditCategory(row.category);
    setEditPrice(String(row.price));
    setEditStock(row.stock === null ? "" : String(row.stock));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditCategory(null);
    setEditPrice("");
    setEditStock("");
  };

  const saveEdit = async (row: VendorProductRow) => {
    if (editBusy) return;
    const priceNum = Number.parseInt(editPrice.replace(/\D/g, ""), 10);
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      toast("Enter a valid price.");
      return;
    }

    const payload: Record<string, unknown> = { price: priceNum };
    const effectiveSlug = editCategory ?? row.category;
    if (editCategory && editCategory !== row.category) {
      payload.category = editCategory;
    }

    if (listingModeForSlug(effectiveSlug, directoryRows) === "shop") {
      const raw = editStock.trim();
      if (raw === "") {
        payload.stock = null;
      } else {
        const n = Number.parseInt(raw, 10);
        if (!Number.isFinite(n) || n < 0) {
          toast("Stock must be a whole number or empty.");
          return;
        }
        payload.stock = n;
      }
    }

    setEditBusy(true);
    try {
      await apiFetch(`/api/products/${row.id}/update`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      toast("Listing updated.");
      cancelEdit();
      await loadListings();
    } catch (err) {
      if (err instanceof ApiError && err.body.error === "not_found") {
        toast("Listing not found. Refresh the page.");
      } else {
        toast("Could not save changes.");
      }
    } finally {
      setEditBusy(false);
    }
  };

  const deactivate = async (row: VendorProductRow) => {
    if (editBusy || !row.active) return;
    if (!window.confirm(`Hide "${row.title}" from the catalog?`)) return;

    setEditBusy(true);
    try {
      await apiFetch(`/api/products/${row.id}/update`, {
        method: "POST",
        body: JSON.stringify({ active: false }),
      });
      toast("Listing hidden from buyers.");
      if (editingId === row.id) cancelEdit();
      await loadListings();
    } catch {
      toast("Could not hide listing.");
    } finally {
      setEditBusy(false);
    }
  };

  return (
    <div className="card">
      <div className="t">Stock</div>
      {listings === null ? (
        <div className="m">Loading listings…</div>
      ) : listError ? (
        <>
          <div className="warn">Could not load your listings.</div>
          <button type="button" className="btn s" onClick={() => void loadListings()}>
            Retry
          </button>
        </>
      ) : listings.length === 0 ? (
        <div className="m">Nothing published yet. Add a listing in the first tab.</div>
      ) : (
        <ul className="shop-stock-list">
          {listings.map((row) => {
            const editing = editingId === row.id;
            const catLabel = directoryLabel(row.category, directoryRows);
            const effectiveEditSlug = editCategory ?? row.category;
            const showStockOnEdit =
              listingModeForSlug(effectiveEditSlug, directoryRows) === "shop";
            return (
              <li key={row.id} className="shop-stock-row">
                <div className="shop-stock-main">
                  <span className="shop-stock-emoji" aria-hidden>
                    {row.emoji}
                  </span>
                  <div>
                    <div className="shop-stock-title">{row.title}</div>
                    <div className="m">
                      {catLabel} · {row.active ? "Live" : "Hidden"}
                      {row.stock !== null ? ` · ${row.stock} in stock` : ""}
                    </div>
                  </div>
                </div>
                {editing ? (
                  <div className="shop-stock-edit">
                    <label htmlFor={`edit-cat-${row.id}`}>Category</label>
                    <select
                      id={`edit-cat-${row.id}`}
                      value={effectiveEditSlug}
                      disabled={editBusy}
                      onChange={(e) => setEditCategory(e.target.value)}
                    >
                      {directoryRows.map((opt) => (
                        <option key={opt.slug} value={opt.slug}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <label htmlFor={`edit-price-${row.id}`}>Price (KES)</label>
                    <input
                      id={`edit-price-${row.id}`}
                      inputMode="numeric"
                      value={editPrice}
                      disabled={editBusy}
                      onChange={(e) => setEditPrice(e.target.value)}
                    />
                    {showStockOnEdit ? (
                      <>
                        <label htmlFor={`edit-stock-${row.id}`}>Stock</label>
                        <input
                          id={`edit-stock-${row.id}`}
                          inputMode="numeric"
                          placeholder="Empty = unlimited"
                          value={editStock}
                          disabled={editBusy}
                          onChange={(e) => setEditStock(e.target.value)}
                        />
                      </>
                    ) : null}
                    <div className="listing-photo-row">
                      <button
                        type="button"
                        className="btn s"
                        disabled={editBusy}
                        onClick={() => void saveEdit(row)}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className="btn s"
                        disabled={editBusy}
                        onClick={cancelEdit}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="listing-photo-row">
                    <div className="shop-stock-price">
                      KES {row.price.toLocaleString()}
                    </div>
                    <button
                      type="button"
                      className="btn s"
                      disabled={editBusy || !row.active}
                      onClick={() => startEdit(row)}
                    >
                      Edit
                    </button>
                    {row.active ? (
                      <button
                        type="button"
                        className="btn s"
                        disabled={editBusy}
                        onClick={() => void deactivate(row)}
                      >
                        Hide
                      </button>
                    ) : null}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
