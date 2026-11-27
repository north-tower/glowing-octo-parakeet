"use client";

import { apiFetch, ApiError } from "@/lib/nakuru/api";
import { MAX_IMAGE_BYTES } from "@/lib/nakuru/data/constants";
import { resizeImageFile } from "@/lib/nakuru/resize-image";
import type { ListingMode } from "@/lib/nakuru/types";
import {
  useCategories,
  type CategoryPublicApiRow,
} from "@/lib/nakuru/use-categories";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { SearchableCategorySelect } from "@/components/app/vendor/SearchableCategorySelect";
import {
  defaultListingCategorySlug,
  listingCategoryBreadcrumb,
  listingLeavesForVendor,
  parentSlugForCustomCategory,
  vendorRootLabels,
  visibleOfficialRoots,
} from "@/lib/nakuru/vendor-category-pick";

function listingModeForSlug(
  slug: string,
  rows: { slug: string; listingMode: ListingMode }[],
): ListingMode {
  return rows.find((r) => r.slug === slug)?.listingMode ?? "shop";
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
  const mainCategories = useMemo(
    () => visibleOfficialRoots(directoryRows),
    [directoryRows],
  );
  const [rootSlug, setRootSlug] = useState<string | null>(null);
  const listingOptions = useMemo(
    () =>
      rootSlug
        ? listingLeavesForVendor(directoryRows, [rootSlug])
        : [],
    [directoryRows, rootSlug],
  );
  const officialOptions = listingOptions.filter((r) => r.kind === "official");
  const communityOptions = listingOptions.filter((r) => r.kind === "community");
  const shopSections = useMemo(
    () => vendorRootLabels(vendorCategories, directoryRows),
    [vendorCategories, directoryRows],
  );

  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const selectedListingMode = selectedSlug
    ? listingModeForSlug(selectedSlug, directoryRows)
    : null;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [listingImage, setListingImage] = useState("");
  const [imageBusy, setImageBusy] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [catCreateBusy, setCatCreateBusy] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const preferredDefault = useMemo(
    () =>
      defaultListingCategorySlug(
        listingOptions,
        rootSlug ? [rootSlug] : vendorCategories,
        directoryRows,
      ),
    [listingOptions, rootSlug, vendorCategories, directoryRows],
  );

  useEffect(() => {
    const allowedRoots = new Set(mainCategories.map((row) => row.slug));
    if (!allowedRoots.size) {
      setRootSlug(null);
      return;
    }
    setRootSlug((prev) => {
      if (prev && allowedRoots.has(prev)) return prev;
      const fromVendor = vendorCategories.find((slug) => allowedRoots.has(slug));
      return fromVendor ?? mainCategories[0]!.slug;
    });
  }, [mainCategories, vendorCategories]);

  useEffect(() => {
    const allowed = new Set(listingOptions.map((row) => row.slug));
    if (!allowed.size) {
      setSelectedSlug(null);
      return;
    }
    setSelectedSlug((prev) => {
      if (prev && allowed.has(prev)) return prev;
      return preferredDefault ?? listingOptions[0]!.slug;
    });
  }, [listingOptions, preferredDefault]);

  const createCustomCategory = async (label: string): Promise<boolean> => {
    if (catCreateBusy || busy) return false;
    const trimmed = label.trim();
    if (trimmed.length < 2) {
      toast("Category name needs at least 2 characters.");
      return false;
    }
    const parentSlug = parentSlugForCustomCategory(
      rootSlug ? [rootSlug] : vendorCategories,
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
      emoji: mode === "shop" ? "🛍️" : "🔧",
      price: priceNum,
    };
    if (mode === "shop" && stockVal !== undefined) {
      body.stock = stockVal;
    }
    if (listingImage) {
      body.imageDataUrl = listingImage;
    }

    console.info("[listing-create] client submit", {
      vendorId,
      category: selectedSlug,
      titleLen: trimmedTitle.length,
      descLen: description.trim().length,
      price: priceNum,
      mode,
      stock: stockVal ?? null,
      hasImage: Boolean(listingImage),
      imageChars: listingImage.length,
    });

    setBusy(true);
    try {
      await apiFetch("/api/products", {
        method: "POST",
        body: JSON.stringify(body),
      });
      console.info("[listing-create] client ok");
      toast("Listing published.");
      resetCreateForm();
      onPublished?.();
    } catch (err) {
      if (err instanceof ApiError) {
        console.error("[listing-create] client api error", {
          status: err.status,
          error: err.body.error,
        });
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
      } else {
        console.error("[listing-create] client unexpected", err);
      }
      toast("Could not publish. Check the fields and try again.");
    } finally {
      setBusy(false);
    }
  };

  const selectedLabel = listingCategoryBreadcrumb(
    selectedSlug,
    directoryRows,
  );

  if (!mainCategories.length) {
    return (
      <div className="card">
        <div className="t">Publish a listing</div>
        <div className="m">
          Categories could not be loaded. Refresh the page and try again.
        </div>
      </div>
    );
  }

  return (
    <form
      className="card vendor-listing-form"
      onSubmit={publish}
      data-shop-sections={shopSections.join(",")}
    >
      <div className="vendor-listing-form-hd">
        <div className="t">Publish a listing</div>
        <div className="m">
          {shopArea
            ? `Buyers will see this listing in ${shopArea}.`
            : "Set your shop area on the profile above before publishing."}
        </div>
      </div>

      <div className="vendor-listing-form-body">
        <div className="vendor-listing-form-main">
      <label>Main category</label>
      <div className="m" style={{ marginBottom: 8 }}>
        Choose a section, then pick a subcategory.
      </div>
      <div
        className="row"
        style={{ flexWrap: "wrap", gap: 8, marginBottom: 12 }}
      >
        {mainCategories.map((row) => (
          <button
            key={row.slug}
            type="button"
            className={`chip${rootSlug === row.slug ? " on" : ""}`}
            aria-pressed={rootSlug === row.slug}
            disabled={busy}
            onClick={() => setRootSlug(row.slug)}
          >
            {row.label}
          </button>
        ))}
      </div>

      <label>Subcategory</label>
      <div className="m" style={{ marginBottom: 8 }}>
        {selectedLabel || "Pick a subcategory"}
      </div>
      <SearchableCategorySelect
        id="vp-listing-cat"
        value={selectedSlug ?? preferredDefault ?? ""}
        disabled={busy || !rootSlug}
        officialOptions={officialOptions}
        communityOptions={communityOptions}
        createBusy={catCreateBusy}
        onCreateCustom={createCustomCategory}
        onChange={(slug) => {
          setSelectedSlug(slug || null);
        }}
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
        </div>

        <div className="vendor-listing-form-aside">
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
              {imageBusy
                ? "Processing…"
                : listingImage
                  ? "Change photo"
                  : "Add photo"}
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
            <div className="listing-photo-preview vendor-listing-photo-preview">
              <img src={listingImage} alt="Listing preview" />
            </div>
          ) : (
            <div className="m">
              JPG, PNG, or WebP up to 5 MB. Shown on the catalog card.
            </div>
          )}
        </div>

        <div className="vendor-listing-form-pricing">
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
        </div>
      </div>

      <button
        type="submit"
        className="btn full vendor-listing-form-submit"
        disabled={busy || !selectedSlug || !shopArea}
      >
        {busy ? "Publishing…" : "Publish listing"}
      </button>
    </form>
  );
}
