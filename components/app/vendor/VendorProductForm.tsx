"use client";

import { apiFetch, ApiError } from "@/lib/nakuru/api";
import { MAX_IMAGE_BYTES } from "@/lib/nakuru/data/constants";
import { resizeImageFile } from "@/lib/nakuru/resize-image";
import type { ListingMode } from "@/lib/nakuru/types";
import {
  useCategories,
  type CategoryPublicApiRow,
} from "@/lib/nakuru/use-categories";
import type { DirectoryCategory } from "@/lib/nakuru/data/category-directory";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { SearchableCategorySelect } from "@/components/app/vendor/SearchableCategorySelect";

function listingModeForSlug(
  slug: string,
  rows: { slug: string; listingMode: ListingMode }[],
): ListingMode {
  return rows.find((r) => r.slug === slug)?.listingMode ?? "shop";
}

/** Parent for a new community leaf — must match a category root the vendor sells under. */
function parentSlugForCustomCategory(
  vendorRoots: string[],
  rows: DirectoryCategory[],
): string {
  const bySlug = new Map(rows.map((r) => [r.slug, r]));
  for (const slug of vendorRoots) {
    const row = bySlug.get(slug);
    if (row && row.depth <= 1) return slug;
    if (row?.parentSlug) {
      const parent = bySlug.get(row.parentSlug);
      if (parent && parent.depth <= 1) return parent.slug;
    }
  }
  const openRoot = rows.find(
    (r) => r.kind === "official" && r.depth === 0 && r.openForApply,
  );
  return openRoot?.slug ?? "business-and-industry";
}

type Props = {
  vendorId: string;
  vendorCategories: string[];
  shopArea: string | null;
  toast: (msg: string) => void;
  onPublished?: () => void;
};

export function VendorProductForm({
  vendorId,
  vendorCategories,
  shopArea,
  toast,
  onPublished,
}: Props) {
  const { rows: directoryRows, upsertRow } = useCategories();
  const listingOptions = directoryRows.filter(
    (r) => r.visible && !r.hasChildren,
  );
  const officialOptions = listingOptions.filter((r) => r.kind === "official");
  const communityOptions = listingOptions.filter((r) => r.kind === "community");

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
  const [catCreateBusy, setCatCreateBusy] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const defaultSlug = useMemo(
    () => listingOptions[0]?.slug ?? null,
    [listingOptions],
  );

  useEffect(() => {
    const allowed = listingOptions.map((row) => row.slug);
    if (!allowed.length) {
      setSelectedSlug(null);
      return;
    }
    setSelectedSlug((prev) => {
      if (prev && allowed.includes(prev)) return prev;
      if (
        prev &&
        directoryRows.some(
          (r) => r.slug === prev && r.visible && !r.hasChildren,
        )
      ) {
        return prev;
      }
      return allowed[0]!;
    });
  }, [listingOptions, directoryRows]);

  useEffect(() => {
    if (!selectedListingMode) return;
    setEmoji(selectedListingMode === "shop" ? "🛍️" : "🔧");
  }, [selectedListingMode]);

  const createCustomCategory = async (label: string): Promise<boolean> => {
    if (catCreateBusy || busy) return false;
    const trimmed = label.trim();
    if (trimmed.length < 2) {
      toast("Category name needs at least 2 characters.");
      return false;
    }
    const parentSlug = parentSlugForCustomCategory(
      vendorCategories,
      directoryRows,
    );
    setCatCreateBusy(true);
    try {
      const row = await apiFetch<CategoryPublicApiRow>("/api/categories", {
        method: "POST",
        body: JSON.stringify({ label: trimmed, parentSlug }),
      });
      upsertRow(row);
      setSelectedSlug(row.slug);
      toast(
        shopArea
          ? `Category “${row.label}” is ready. Finish the listing and publish.`
          : `Category “${row.label}” is ready. Set shop area, then publish.`,
      );
      return true;
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.body.error === "too_many_requests") {
          toast("Too many new categories today. Try again tomorrow.");
          return false;
        }
        if (err.body.error === "category_hidden") {
          toast("That category name exists but is not available.");
          return false;
        }
        if (err.status === 401) {
          toast("Sign in again to add a category.");
          return false;
        }
        if (err.status === 400) {
          toast("That category name is not allowed. Try another.");
          return false;
        }
      }
      toast("Could not create that category. Try a different name.");
      return false;
    } finally {
      setCatCreateBusy(false);
    }
  };

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

  const publish = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!selectedSlug || busy) return;
    if (!shopArea) {
      toast("Set your shop area on the profile first.");
      return;
    }

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
      onPublished?.();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.body.error === "area_required") {
          toast("Set your shop area on the profile first.");
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

  if (!listingOptions.length) {
    return (
      <div className="card">
        <div className="t">Publish a listing</div>
        <div className="m">No categories are available yet. Try again shortly.</div>
      </div>
    );
  }

  return (
    <form className="card" onSubmit={publish}>
      <div className="t">Publish a listing</div>
      <div className="m">
        {shopArea
          ? `Buyers will see this listing in ${shopArea}. Pick a category or type a new one.`
          : "Set your shop area on the profile above before publishing."}
      </div>

      <label htmlFor="vp-listing-cat">Category</label>
      <div className="m">
        Search an existing category, or type a new name and choose{" "}
        <strong>Add as new category</strong>.
      </div>
      <SearchableCategorySelect
        id="vp-listing-cat"
        value={selectedSlug ?? defaultSlug ?? ""}
        disabled={busy}
        officialOptions={officialOptions}
        communityOptions={communityOptions}
        createBusy={catCreateBusy}
        onCreateCustom={createCustomCategory}
        onChange={(slug) => setSelectedSlug(slug || null)}
      />

      <label htmlFor="vp-new-cat">New category name</label>
      <div className="row cat-create-row">
        <input
          id="vp-new-cat"
          maxLength={40}
          placeholder="e.g. Cyber"
          value={newCategoryName}
          disabled={busy || catCreateBusy}
          onChange={(e) => setNewCategoryName(e.target.value)}
        />
        <button
          type="button"
          className="btn s"
          disabled={busy || catCreateBusy || newCategoryName.trim().length < 2}
          onClick={() => {
            void createCustomCategory(newCategoryName).then((ok) => {
              if (ok) setNewCategoryName("");
            });
          }}
        >
          {catCreateBusy ? "Adding…" : "Add category"}
        </button>
      </div>

      <label htmlFor="vp-title">Title</label>
      <input
        id="vp-title"
        maxLength={80}
        placeholder="e.g. Men's size 42 sneakers"
        value={title}
        disabled={busy || !shopArea}
        onChange={(e) => setTitle(e.target.value)}
      />

      <label htmlFor="vp-desc">Description (optional)</label>
      <textarea
        id="vp-desc"
        maxLength={500}
        rows={4}
        placeholder="e.g. Size 42, worn twice, box included"
        value={description}
        disabled={busy || !shopArea}
        onChange={(e) => setDescription(e.target.value)}
        aria-describedby="vp-desc-hint"
      />
      <div className="m" id="vp-desc-hint" style={{ marginTop: 4 }}>
        {description.length}/500 — sizes, what&apos;s included, condition
      </div>

      <label>Photo</label>
      <input
        ref={imageInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        hidden
        disabled={busy || imageBusy || !shopArea}
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
          disabled={busy || imageBusy || !shopArea}
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
        disabled={busy || !!listingImage || !shopArea}
        onChange={(e) => setEmoji(e.target.value)}
      />

      <label htmlFor="vp-price">Price (KES)</label>
      <input
        id="vp-price"
        inputMode="numeric"
        placeholder="e.g. 2500"
        value={price}
        disabled={busy || !shopArea}
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
            disabled={busy || !shopArea}
            onChange={(e) => setStock(e.target.value)}
          />
        </>
      ) : null}

      <button
        type="submit"
        className="btn full"
        disabled={busy || !selectedSlug || !shopArea}
      >
        {busy ? "Publishing…" : "Publish listing"}
      </button>
    </form>
  );
}
