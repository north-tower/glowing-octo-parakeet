"use client";

import { useNakuruApp } from "@/components/app/AppProvider";
import { usePwaInstall } from "@/components/app/pwa/InstallProvider";
import { homeCopy } from "@/lib/nakuru/home-i18n";
import {
  Avatar,
  ProfilePhotoUpload,
} from "@/components/app/ProfilePhotoUpload";
import { apiFetch, ApiError } from "@/lib/nakuru/api";
import { useCategories } from "@/lib/nakuru/use-categories";
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
  const roots = rows.filter((r) => r.depth === 0);
  if (loading || roots.length === 0) return ["mobile-phones-tablets"];
  const preferred = roots.find(
    (r) => r.slug === "mobile-phones-tablets" && r.openForApply,
  );
  if (preferred) return [preferred.slug];
  const firstOpen = roots.find((r) => r.openForApply)?.slug;
  return firstOpen ? [firstOpen] : [roots[0]!.slug];
}

type Props = {
  disabled?: boolean;
  onApplied: () => void;
  toast: (msg: string) => void;
};

export function VendorApplyForm({ disabled, onApplied, toast }: Props) {
  const { state } = useNakuruApp();
  const { lang } = usePwaInstall();
  const { rows, loading } = useCategories();
  const [name, setName] = useState("");
  const [categories, setCategories] = useState<string[] | null>(null);
  const [catPick, setCatPick] = useState("");
  const [catError, setCatError] = useState("");
  const [busy, setBusy] = useState(false);

  const applyRows = useMemo(
    () => rows.filter((r) => r.depth === 0),
    [rows],
  );

  const defaultCategories = useMemo(
    () => defaultCategorySelection(applyRows, loading),
    [applyRows, loading],
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

  const onAddExisting = () => {
    if (disabled || busy) return;
    setCatError("");
    if (!catPick) {
      setCatError("Choose a category from the list.");
      return;
    }
    const current = categories ?? defaultCategories;
    if (current.includes(catPick)) {
      setCatError("That category is already selected.");
      return;
    }
    if (current.length >= 4) {
      setCatError("You can pick up to four categories.");
      return;
    }
    toggleCategory(catPick);
    setCatPick("");
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
      <div className="m">{homeCopy("vendorApplySameAccount", lang)}</div>
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
        {applyRows.map((row) => {
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
            return (
              <button
                key={row.slug}
                type="button"
                className="chip"
                disabled
                title="Opens after launch"
              >
                {row.label}
                {" (soon)"}
              </button>
            );
          }
          return null;
        })}
      </div>

      <label htmlFor="vendor-apply-cat">Add a category</label>
      <div className="row">
        <select
          id="vendor-apply-cat"
          value={catPick}
          disabled={disabled || busy || loading}
          onChange={(e) => {
            setCatPick(e.target.value);
            if (catError) setCatError("");
          }}
        >
          <option value="">Select a category</option>
          {applyRows.map((row) => {
            const selected = activeCategories.includes(row.slug);
            const closed = !row.openForApply;
            return (
              <option
                key={row.slug}
                value={row.slug}
                disabled={selected || closed}
              >
                {row.label}
                {selected ? " (selected)" : closed ? " (soon)" : ""}
              </option>
            );
          })}
        </select>
        <button
          type="button"
          className="btn s"
          disabled={disabled || busy || !catPick}
          onClick={onAddExisting}
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