"use client";

import { useNakuruApp } from "@/components/app/AppProvider";
import {
  Avatar,
  ProfilePhotoUpload,
} from "@/components/app/ProfilePhotoUpload";
import { apiFetch, ApiError } from "@/lib/nakuru/api";
import { SOON } from "@/lib/nakuru/data/constants";
import {
  useCategories,
  type CategoryPublicApiRow,
} from "@/lib/nakuru/use-categories";
import type { CategoryId } from "@/lib/nakuru/types";
import {
  useCallback,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import type { DirectoryCategory } from "@/lib/nakuru/data/category-directory";

function defaultCategorySelection(
  rows: DirectoryCategory[],
  loading: boolean,
): string[] {
  if (loading || rows.length === 0) return ["shop"];
  const shopOpen = rows.some((r) => r.slug === "shop" && r.openForApply);
  if (shopOpen) return ["shop"];
  const firstOpen = rows.find((r) => r.openForApply)?.slug;
  return firstOpen ? [firstOpen] : ["shop"];
}

type Props = {
  disabled?: boolean;
  onApplied: () => void;
  toast: (msg: string) => void;
};

export function VendorApplyForm({ disabled, onApplied, toast }: Props) {
  const { state } = useNakuruApp();
  const { rows, loading, upsertRow } = useCategories();
  const [name, setName] = useState("");
  const [categories, setCategories] = useState<string[] | null>(null);
  const [catDraft, setCatDraft] = useState("");
  const [catError, setCatError] = useState("");
  const [busy, setBusy] = useState(false);

  const defaultCategories = useMemo(
    () => defaultCategorySelection(rows, loading),
    [rows, loading],
  );
  const activeCategories = categories ?? defaultCategories;

  const toggleCategory = useCallback(
    (slug: string) => {
      setCategories((prev) => {
        const current = prev ?? defaultCategories;
        const on = current.includes(slug);
        if (on) {
          const next = current.filter((c) => c !== slug);
          return next.length ? next : current;
        }
        if (current.length >= 4) return current;
        return [...current, slug];
      });
    },
    [defaultCategories],
  );

  const onAddCustom = async () => {
    if (disabled || busy) return;
    setCatError("");

    const label = catDraft.trim();
    if (!label) {
      setCatError("Use 2–40 letters or numbers.");
      return;
    }

    setBusy(true);
    try {
      const row = await apiFetch<CategoryPublicApiRow>("/api/categories", {
        method: "POST",
        body: JSON.stringify({ label }),
      });
      upsertRow(row);
      setCatDraft("");
      setCategories((prev) => {
        const current = prev ?? defaultCategories;
        if (current.includes(row.slug)) return current;
        if (current.length >= 4) return current;
        return [...current, row.slug];
      });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409 && err.body.error === "category_hidden") {
          setCatError("That category is closed. Pick another.");
          return;
        }
        if (err.status === 401) {
          setCatError("Sign in with your email code first.");
          return;
        }
        if (err.status === 400) {
          setCatError("Use 2–40 letters or numbers.");
          return;
        }
      }
      setCatError("Could not add. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (disabled || busy) return;

    const trimmed = name.trim();
    if (trimmed.length < 2) {
      toast("Enter your business name (at least 2 characters).");
      return;
    }
    if (!activeCategories.length) {
      toast("Choose at least one category.");
      return;
    }

    setBusy(true);
    try {
      const body: {
        name: string;
        categories: string[];
        imageDataUrl?: string;
      } = { name: trimmed, categories: activeCategories };
      if (state.photo) {
        body.imageDataUrl = state.photo;
      }
      await apiFetch("/api/vendors", {
        method: "POST",
        body: JSON.stringify(body),
      });
      toast("Application submitted. We'll review it soon.");
      setName("");
      onApplied();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 429 && err.body.error === "too_many_pending") {
          toast("You already have several pending applications. Wait for review.");
          return;
        }
        if (err.status === 401) {
          toast("Sign in with your email code first.");
          return;
        }
        if (err.status === 400) {
          toast("Check your name, photo, and categories and try again.");
          return;
        }
        if (err.status === 503 && err.body.error === "image_upload_failed") {
          toast("Photo could not be saved. Try again or apply without a photo.");
          return;
        }
      }
      toast("Could not submit. Try again in a moment.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <h2>Sell on NakuruHub</h2>
      <div className="m">
        Free to join. Add a profile picture or shop logo, then pick the
        categories you sell in—each is reviewed separately. Your identity is
        tied to your verified email; staff may ask for ID offline if needed.
      </div>

      <div className="row" style={{ marginTop: 12, marginBottom: 12 }}>
        <ProfilePhotoUpload
          className="pfp"
          role="button"
          aria-label="Upload profile picture or shop logo"
        >
          <Avatar photo={state.photo} />
          <b>📷</b>
        </ProfilePhotoUpload>
        <div className="m" style={{ alignSelf: "center" }}>
          Tap to add a profile picture or shop logo (optional)
        </div>
      </div>

      <label htmlFor="vendor-apply-name">Your name or business</label>
      <input
        id="vendor-apply-name"
        maxLength={60}
        autoComplete="organization"
        placeholder="e.g. Mama Fashions"
        value={name}
        disabled={disabled || busy}
        onChange={(e) => setName(e.target.value)}
      />

      <label>Categories (tap to add or remove)</label>
      <div>
        {rows.map((row) => {
          if (row.openForApply) {
            const on = activeCategories.includes(row.slug);
            return (
              <button
                key={row.slug}
                type="button"
                className={`chip${on ? " on" : ""}`}
                disabled={disabled || busy || loading}
                onClick={() => toggleCategory(row.slug)}
              >
                {row.label}
              </button>
            );
          }
          if (row.kind === "official") {
            const soonSlug = row.slug as CategoryId;
            const suffix = SOON[soonSlug]
              ? " (waitlist)"
              : " (soon)";
            return (
              <button
                key={row.slug}
                type="button"
                className="chip"
                disabled
                title="Opens after launch"
              >
                {row.label}
                {suffix}
              </button>
            );
          }
          return null;
        })}
      </div>

      <label htmlFor="vendor-apply-cat">Add a category</label>
      <div className="row">
        <input
          id="vendor-apply-cat"
          maxLength={40}
          value={catDraft}
          disabled={disabled || busy}
          placeholder="e.g. Fashion"
          onChange={(e) => {
            setCatDraft(e.target.value);
            if (catError) setCatError("");
          }}
        />
        <button
          type="button"
          className="btn s"
          disabled={disabled || busy}
          onClick={() => void onAddCustom()}
        >
          Add
        </button>
      </div>
      {catError ? <div className="err">{catError}</div> : null}

      <div className="warn" style={{ marginTop: 12 }}>
        No document upload in the app yet. Unverified vendors can use cash on
        delivery only until staff verify you.
      </div>

      <button
        type="submit"
        className="btn full"
        disabled={disabled || busy}
      >
        {busy ? "Submitting…" : "Submit for approval"}
      </button>
    </form>
  );
}