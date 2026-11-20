"use client";

import { apiFetch, ApiError } from "@/lib/nakuru/api";
import type { DirectoryCategory } from "@/lib/nakuru/data/category-directory";
import {
  MAX_IMAGE_BYTES,
} from "@/lib/nakuru/data/constants";
import { resizeImageFile } from "@/lib/nakuru/resize-image";
import type { ListingMode } from "@/lib/nakuru/types";
import {
  useCategories,
  type CategoryPublicApiRow,
} from "@/lib/nakuru/use-categories";
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

function directoryLabel(slug: string, rows: DirectoryCategory[]): string {
  const row = rows.find((r) => r.slug === slug);
  return row?.label ?? slug;
}

function listingModeForSlug(
  slug: string,
  rows: DirectoryCategory[],
): ListingMode {
  const row = rows.find((r) => r.slug === slug);
  return row?.listingMode ?? "shop";
}

function isPublishableListingMode(mode: ListingMode): boolean {
  return mode === "shop" || mode === "services";
}

type Props = {
  vendorId: string;
  approvedCategories: string[];
  toast: (msg: string) => void;
  onCategoriesChange?: () => void;
};

export function VendorProductForm({
  vendorId,
  approvedCategories,
  toast,
  onCategoriesChange,
}: Props) {
  const { rows: directoryRows, upsertRow } = useCategories();

  const publishSlugs = useMemo(
    () =>
      approvedCategories.filter((slug) =>
        isPublishableListingMode(listingModeForSlug(slug, directoryRows)),
      ),
    [approvedCategories, directoryRows],
  );

  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const selectedListingMode = selectedSlug
    ? listingModeForSlug(selectedSlug, directoryRows)
    : null;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [emoji, setEmoji] = useState("🛍️");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [listingImage, setListingImage] = useState("");
  const [imageBusy, setImageBusy] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const [catDraft, setCatDraft] = useState("");
  const [catBusy, setCatBusy] = useState(false);

  const [listings, setListings] = useState<VendorProductRow[] | null>(null);
  const [listError, setListError] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCategory, setEditCategory] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [editStock, setEditStock] = useState("");
  const [editBusy, setEditBusy] = useState(false);

  useEffect(() => {
    if (!publishSlugs.length) {
      setSelectedSlug(null);
      return;
    }
    setSelectedSlug((prev) =>
      prev && publishSlugs.includes(prev) ? prev : publishSlugs[0]!,
    );
  }, [publishSlugs]);

  useEffect(() => {
    if (!selectedListingMode) return;
    setEmoji(selectedListingMode === "shop" ? "🛍️" : "🔧");
  }, [selectedListingMode]);

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
  }, [loadListings]);

  const resetCreateForm = () => {
    setTitle("");
    setDescription("");
    setPrice("");
    setStock("");
    setListingImage("");
    if (selectedListingMode) {
      setEmoji(selectedListingMode === "shop" ? "🛍️" : "🔧");
    }
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

  const onAddCategory = async () => {
    if (catBusy) return;
    const label = catDraft.trim();
    if (!label) {
      toast("Use 2–40 letters or numbers.");
      return;
    }

    setCatBusy(true);
    try {
      const result = await apiFetch<{
        categories: string[];
        category: CategoryPublicApiRow;
      }>("/api/vendors/mine/categories", {
        method: "POST",
        body: JSON.stringify({ label }),
      });
      upsertRow(result.category);
      setCatDraft("");
      onCategoriesChange?.();
      toast("Category added to your profile.");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.body.error === "category_limit") {
          toast("You already have 4 categories. Remove one before adding.");
          return;
        }
        if (err.body.error === "no_approved_vendor") {
          toast("Your vendor profile must be approved before adding categories.");
          return;
        }
        if (err.status === 400) {
          toast("Use 2–40 letters or numbers.");
          return;
        }
      }
      toast("Could not add category. Try again.");
    } finally {
      setCatBusy(false);
    }
  };

  const publish = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!selectedSlug || busy) return;

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

    const mode = listingModeForSlug(selectedSlug, directoryRows);
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
      category: selectedSlug,
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
      publishSlugs.includes(row.category)
        ? row.category
        : publishSlugs[0] ?? null,
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
    const effectiveSlug =
      editCategory && publishSlugs.includes(editCategory)
        ? editCategory
        : row.category;
    if (
      publishSlugs.includes(row.category) &&
      editCategory &&
      editCategory !== row.category
    ) {
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

  const addCategoryCard = (
    <div className="card">
      <div className="t">Add a category</div>
      <div className="m">
        Create a new name for what you sell (e.g. Fashion). It is added to your
        approved profile, up to four categories total.
      </div>
      <label htmlFor="vp-add-cat">Category name</label>
      <div className="row">
        <input
          id="vp-add-cat"
          maxLength={40}
          value={catDraft}
          disabled={catBusy || busy}
          placeholder="e.g. Fashion"
          onChange={(e) => setCatDraft(e.target.value)}
        />
        <button
          type="button"
          className="btn s"
          disabled={catBusy || busy}
          onClick={() => void onAddCategory()}
        >
          {catBusy ? "Adding…" : "Add"}
        </button>
      </div>
    </div>
  );

  const listingsCard = (
    <div className="card">
      <div className="t">My listings</div>
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
            {listings.map((row) => {
              const editing = editingId === row.id;
              const catLabel = directoryLabel(row.category, directoryRows);
              const rowInPicker = publishSlugs.includes(row.category);
              const effectiveEditSlug = editCategory ?? row.category;
              const showStockOnEdit =
                listingModeForSlug(effectiveEditSlug, directoryRows) === "shop";
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
                        {publishSlugs.length > 1 && rowInPicker ? (
                          <span style={{ marginRight: 6 }}>
                            {publishSlugs.map((slug) => (
                              <button
                                key={slug}
                                type="button"
                                className={`chip${editCategory === slug ? " on" : ""}`}
                                disabled={editBusy}
                                style={{ marginBottom: 4 }}
                                onClick={() => setEditCategory(slug)}
                              >
                                {directoryLabel(slug, directoryRows)}
                              </button>
                            ))}
                          </span>
                        ) : null}
                        {showStockOnEdit ? (
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
  );

  if (!publishSlugs.length) {
    return (
      <>
        {addCategoryCard}
        <div className="card">
          <div className="t">Publish listings</div>
          <div className="m">
            Shop- and services-style categories open here once they are on your
            vendor profile. Add a category above or wait for staff-approved
            types.
          </div>
        </div>
        {listingsCard}
      </>
    );
  }

  return (
    <>
      {addCategoryCard}

      <form className="card" onSubmit={publish}>
        <div className="t">Publish a listing</div>
        <div className="m">
          {selectedListingMode === "shop"
            ? "Buyers can add shop items to cart and pay on delivery."
            : "Services show in the catalog; buyers request a quote (no instant checkout)."}
        </div>

        <label>Listing type</label>
        <div>
          {publishSlugs.map((slug) => (
            <button
              key={slug}
              type="button"
              className={`chip${selectedSlug === slug ? " on" : ""}`}
              disabled={busy}
              onClick={() => setSelectedSlug(slug)}
            >
              {directoryLabel(slug, directoryRows)}
            </button>
          ))}
        </div>

        <label htmlFor="vp-title">Title</label>
        <input
          id="vp-title"
          maxLength={80}
          placeholder={
            selectedListingMode === "shop"
              ? "e.g. Men's size 42 sneakers"
              : "e.g. House wiring"
          }
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

        {selectedListingMode === "shop" ? (
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

        <button type="submit" className="btn full" disabled={busy || !selectedSlug}>
          {busy ? "Publishing…" : "Publish listing"}
        </button>
      </form>

      {listingsCard}
    </>
  );
}