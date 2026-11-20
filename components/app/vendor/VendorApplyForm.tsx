"use client";

import { useNakuruApp } from "@/components/app/AppProvider";
import {
  Avatar,
  ProfilePhotoUpload,
} from "@/components/app/ProfilePhotoUpload";
import { apiFetch, ApiError } from "@/lib/nakuru/api";
import { CATS, SOON } from "@/lib/nakuru/data/constants";
import type { CategoryId } from "@/lib/nakuru/types";
import { useCallback, useMemo, useState, type FormEvent } from "react";

const LAUNCH_CATEGORIES = new Set(
  (process.env.NEXT_PUBLIC_LAUNCH_CATEGORIES || "shop,services")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
);

type Props = {
  disabled?: boolean;
  onApplied: () => void;
  toast: (msg: string) => void;
};

export function VendorApplyForm({ disabled, onApplied, toast }: Props) {
  const { state } = useNakuruApp();
  const [name, setName] = useState("");
  const [categories, setCategories] = useState<CategoryId[]>(["shop"]);
  const [busy, setBusy] = useState(false);

  const launchCats = useMemo(
    () =>
      CATS.filter(
        ([id]) => id !== "all" && LAUNCH_CATEGORIES.has(id),
      ) as [CategoryId, string][],
    [],
  );

  const waitlistCats = useMemo(
    () =>
      CATS.filter(
        ([id]) => id !== "all" && !LAUNCH_CATEGORIES.has(id),
      ) as [CategoryId, string][],
    [],
  );

  const toggleCategory = useCallback((cat: CategoryId) => {
    setCategories((prev) => {
      const on = prev.includes(cat);
      if (on) {
        const next = prev.filter((c) => c !== cat);
        return next.length ? next : prev;
      }
      if (prev.length >= 4) return prev;
      return [...prev, cat];
    });
  }, []);

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (disabled || busy) return;

    const trimmed = name.trim();
    if (trimmed.length < 2) {
      toast("Enter your business name (at least 2 characters).");
      return;
    }
    if (!categories.length) {
      toast("Choose at least one category.");
      return;
    }

    setBusy(true);
    try {
      const body: {
        name: string;
        categories: CategoryId[];
        imageDataUrl?: string;
      } = { name: trimmed, categories };
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
        {launchCats.map(([id, label]) => {
          const on = categories.includes(id);
          return (
            <button
              key={id}
              type="button"
              className={`chip${on ? " on" : ""}`}
              disabled={disabled || busy}
              onClick={() => toggleCategory(id)}
            >
              {label}
            </button>
          );
        })}
        {waitlistCats.map(([id, label]) => (
          <button
            key={id}
            type="button"
            className="chip"
            disabled
            title="Opens after launch"
          >
            {label}
            {SOON[id] ? " (waitlist)" : " (soon)"}
          </button>
        ))}
      </div>

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