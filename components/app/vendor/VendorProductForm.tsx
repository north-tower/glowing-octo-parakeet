"use client";

import { apiFetch, ApiError } from "@/lib/nakuru/api";
import {
  categoryName,
  MAX_IMAGE_BYTES,
} from "@/lib/nakuru/data/constants";
import { resizeImageFile } from "@/lib/nakuru/resize-image";
import type { CategoryId } from "@/lib/nakuru/types";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";

type VendorProductRow = {
  id: string;
  category: string;
  title: string;
  emoji: string;
  price: number;
  stock: number | null;
  active: boolean;
};

const PUBLISH_CATEGORIES = ["shop", "services"] as const;
type PublishCategory = (typeof PUBLISH_CATEGORIES)[number];

function isPublishCategory(c: string): c is PublishCategory {
  return (PUBLISH_CATEGORIES as readonly string[]).includes(c);
}

type Props = {
  vendorId: string;
  approvedCategories: CategoryId[];
  toast: (msg: string) => void;
};

export function VendorProductForm({ vendorId, approvedCategories, toast }: Props) {
  const modes = useMemo(
    () =>
      PUBLISH_CATEGORIES.filter((c) =>
        approvedCategories.includes(c),
      ) as PublishCategory[],
    [approvedCategories],
  );

  const [mode, setMode] = useState<PublishCategory | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [emoji, setEmoji] = useState("🛍️");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [listingImage, setListingImage] = useState("");
  const [imageBusy, setImageBusy] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const [rows, setRows] = useState<VendorProductRow[] | null>(null);
  const [listError, setListError] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCategory, setEditCategory] = useState<PublishCategory | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [editStock, setEditStock] = useState("");
  const [editBusy, setEditBusy] = useState(false);

  useEffect(() => {
    if (!modes.length) {
      setMode(null);
      return;
    }
    setMode((prev) => (prev && modes.includes(prev) ? prev : modes[0]!));
  }, [modes]);

  useEffect(() => {
    if (!mode) return;
    setEmoji(mode === "shop" ? "🛍️" : "🔧");
  }, [mode]);

  const loadListings = useCallback(async () => {
    try {
      const data = await apiFetch<VendorProductRow[]>("/api/vendor/products");
      setRows(data);
      setListError(false);
    } catch {
      setListError(true);
      setRows([]);
    }
  }, []);

  useEffect(() => {
    void loadListings();
  }, [loadListings]);

  const resetCreateForm = () => {
    setTitle("");
    setDescription("");
    setPrice("");
    setStock("");
    setListingImage("");
    if (mode) setEmoji(mode === "shop" ? "🛍️" : "🔧");
  };

  const onListingImage = async (file: File | undefined) => {
    if (!file || imageBusy) return;
    setImageBusy(true);
    try {
      const dataUrl = await resizeImageFile(file, 960, MAX_IMAGE_BYTES);
      setListingImage(dataUrl);
    } catch (err) {
      const code = err instanceof Error ? err.message : "";
      if (code === "type") {
        toast("Choose a JPG, PNG, or WebP image.");
      } else if (code === "size") {
        toast("Image is too large. Max 5 MB.");
      } else {
        toast("Couldn't read that image. Try another.");
      }
    } finally {
      setImageBusy(false);
    }
  };

  const publish = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!mode || busy) return;

    const trimmedTitle = title.trim();
    if (trimmedTitle.length < 2) {
      toast("Enter a title (at least 2 characters).");
      return;
    }

    const priceNum = Number.parseInt(price.replace(/\D/g, ""), 10);
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      toast("Enter a valid price in KES.");
      return;
    }

    let stockVal: number | null | undefined;
    if (mode === "shop") {
      const raw = stock.trim();
      if (raw === "") {
        stockVal = null;
      } else {
        const n = Number.parseInt(raw, 10);
        if (!Number.isFinite(n) || n < 0) {
          toast("Stock must be a whole number or left empty.");
          return;
        }
        stockVal = n;
      }
    }

    const body: Record<string, unknown> = {
      vendorId,
      category: mode,
      title: trimmedTitle,
      description: description.trim(),
      emoji: emoji.trim() || (mode === "shop" ? "🛍️" : "🔧"),
      price: priceNum,
    };
    if (mode === "shop" && stockVal !== undefined) {
      body.stock = stockVal;
    }
    if (listingImage) {
      body.imageDataUrl = listingImage;
    }

    setBusy(true);
    try {
      await apiFetch("/api/products", {
        method: "POST",
        body: JSON.stringify(body),
      });
      toast("Listing published.");
      resetCreateForm();
      await loadListings();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.body.error === "category_not_approved") {
          toast("That category is not on your approved vendor profile.");
          return;
        }
        if (err.body.error === "too_many_products") {
          toast("You have reached the listing limit. Remove old items first.");
          return;
        }
        if (err.body.error === "no_approved_vendor") {
          toast("Your vendor profile must be approved before publishing.");
          return;
        }
        if (err.body.error === "invalid_image") {
          toast("That photo could not be used. Pick another image.");
          return;
        }
        if (err.body.error === "image_upload_failed") {
          toast("Photo upload failed. Try again in a moment.");
          return;
        }
      }
      toast("Could not publish. Check the fields and try again.");
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (row: VendorProductRow) => {
    setEditingId(row.id);
    setEditCategory(
      isPublishCategory(row.category) && modes.includes(row.category)
        ? row.category
        : modes[0] ?? null,
    );
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
    const effectiveCategory =
      editCategory && modes.includes(editCategory) ? editCategory : row.category;
    if (
      isPublishCategory(row.category) &&
      editCategory &&
      editCategory !== row.category
    ) {
      payload.category = editCategory;
    }

    if (effectiveCategory === "shop") {
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
      if (err instanceof ApiError) {
        if (err.body.error === "not_found") {
          toast("Listing not found. Refresh the page.");
          return;
        }
        if (err.body.error === "category_not_approved") {
          toast("That listing type is not on your approved vendor profile.");
          return;
        }
      }
      toast("Could not save changes.");
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

  if (!modes.length) {
    return (
      <div className="card">
        <div className="t">Publish listings</div>
        <div className="m">
          Shop and services publishing open once those categories are approved on
          your vendor profile.
        </div>
      </div>
    );
  }

  return (
    <>
      <form className="card" onSubmit={publish}>
        <div className="t">Publish a listing</div>
        <div className="m">
          {mode === "shop"
            ? "Buyers can add shop items to cart and pay on delivery."
            : "Services show in the catalog; buyers request a quote (no instant checkout)."}
        </div>

        <label>Listing type</label>
        <div>
          {modes.map((c) => (
            <button
              key={c}
              type="button"
              className={`chip${mode === c ? " on" : ""}`}
              disabled={busy}
              onClick={() => setMode(c)}
            >
              {categoryName(c)}
            </button>
          ))}
        </div>

        <label htmlFor="vp-title">Title</label>
        <input
          id="vp-title"
          maxLength={80}
          placeholder={mode === "shop" ? "e.g. Men's size 42 sneakers" : "e.g. House wiring"}
          value={title}
          disabled={busy}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label htmlFor="vp-desc">Description (optional)</label>
        <textarea
          id="vp-desc"
          maxLength={500}
          rows={3}
          placeholder="Sizes, area served, what's included…"
          value={description}
          disabled={busy}
          onChange={(e) => setDescription(e.target.value)}
        />

        <label>Photo</label>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          hidden
          disabled={busy || imageBusy}
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            void onListingImage(f);
          }}
        />
        <div className="listing-photo-row">
          <button
            type="button"
            className="btn s"
            disabled={busy || imageBusy}
            onClick={() => imageInputRef.current?.click()}
          >
            {imageBusy ? "Processing…" : listingImage ? "Change photo" : "Add photo"}
          </button>
          {listingImage ? (
            <button
              type="button"
              className="btn s"
              disabled={busy || imageBusy}
              onClick={() => setListingImage("")}
            >
              Remove
            </button>
          ) : null}
        </div>
        {listingImage ? (
          <div className="listing-photo-preview">
            <img src={listingImage} alt="Listing preview" />
          </div>
        ) : (
          <div className="m">JPG, PNG, or WebP up to 5 MB. Shown on the catalog card.</div>
        )}

        <label htmlFor="vp-emoji">Emoji (when no photo)</label>
        <input
          id="vp-emoji"
          maxLength={8}
          value={emoji}
          disabled={busy || !!listingImage}
          onChange={(e) => setEmoji(e.target.value)}
        />

        <label htmlFor="vp-price">Price (KES)</label>
        <input
          id="vp-price"
          inputMode="numeric"
          placeholder="e.g. 2500"
          value={price}
          disabled={busy}
          onChange={(e) => setPrice(e.target.value)}
        />

        {mode === "shop" ? (
          <>
            <label htmlFor="vp-stock">Stock (optional)</label>
            <input
              id="vp-stock"
              inputMode="numeric"
              placeholder="Leave empty if unlimited"
              value={stock}
              disabled={busy}
              onChange={(e) => setStock(e.target.value)}
            />
          </>
        ) : null}

        <button type="submit" className="btn full" disabled={busy || !mode}>
          {busy ? "Publishing…" : "Publish listing"}
        </button>
      </form>

      <div className="card">
        <div className="t">My listings</div>
        {rows === null ? (
          <div className="m">Loading listings…</div>
        ) : listError ? (
          <>
            <div className="warn">Could not load your listings.</div>
            <button type="button" className="btn s" onClick={() => void loadListings()}>
              Retry
            </button>
          </>
        ) : rows.length === 0 ? (
          <div className="m">Nothing published yet. Add your first listing above.</div>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.875rem",
              marginTop: 8,
            }}
          >
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "6px 4px" }}>Title</th>
                <th style={{ textAlign: "left", padding: "6px 4px" }}>Category</th>
                <th style={{ textAlign: "right", padding: "6px 4px" }}>Price</th>
                <th style={{ textAlign: "center", padding: "6px 4px" }}>Active</th>
                <th style={{ padding: "6px 4px" }} />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const editing = editingId === row.id;
                const catLabel = isPublishCategory(row.category)
                  ? categoryName(row.category)
                  : row.category;
                return (
                  <tr key={row.id}>
                    <td style={{ padding: "8px 4px", verticalAlign: "top" }}>
                      <span aria-hidden>{row.emoji}</span> {row.title}
                    </td>
                    <td style={{ padding: "8px 4px", verticalAlign: "top" }}>{catLabel}</td>
                    <td style={{ padding: "8px 4px", textAlign: "right", verticalAlign: "top" }}>
                      {editing ? (
                        <input
                          inputMode="numeric"
                          value={editPrice}
                          disabled={editBusy}
                          style={{ width: "5.5rem", textAlign: "right" }}
                          onChange={(e) => setEditPrice(e.target.value)}
                        />
                      ) : (
                        `KES ${row.price.toLocaleString()}`
                      )}
                    </td>
                    <td
                      style={{
                        padding: "8px 4px",
                        textAlign: "center",
                        verticalAlign: "top",
                      }}
                    >
                      {row.active ? "Yes" : "Hidden"}
                    </td>
                    <td style={{ padding: "8px 4px", verticalAlign: "top", whiteSpace: "nowrap" }}>
                      {editing ? (
                        <>
                          {modes.length > 1 && isPublishCategory(row.category) ? (
                            <span style={{ marginRight: 6 }}>
                              {modes.map((c) => (
                                <button
                                  key={c}
                                  type="button"
                                  className={`chip${editCategory === c ? " on" : ""}`}
                                  disabled={editBusy}
                                  style={{ marginBottom: 4 }}
                                  onClick={() => setEditCategory(c)}
                                >
                                  {categoryName(c)}
                                </button>
                              ))}
                            </span>
                          ) : null}
                          {(editCategory ?? row.category) === "shop" ? (
                            <input
                              inputMode="numeric"
                              placeholder="Stock"
                              title="Stock (empty = unlimited)"
                              value={editStock}
                              disabled={editBusy}
                              style={{ width: "4rem", marginRight: 4 }}
                              onChange={(e) => setEditStock(e.target.value)}
                            />
                          ) : null}
                          <button
                            type="button"
                            className="btn s"
                            disabled={editBusy}
                            onClick={() => void saveEdit(row)}
                          >
                            Save
                          </button>{" "}
                          <button
                            type="button"
                            className="btn s"
                            disabled={editBusy}
                            onClick={cancelEdit}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            className="btn s"
                            disabled={editBusy || !row.active}
                            onClick={() => startEdit(row)}
                          >
                            Edit
                          </button>{" "}
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
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}