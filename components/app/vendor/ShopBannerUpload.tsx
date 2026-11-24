"use client";

import { apiFetch, ApiError } from "@/lib/nakuru/api";
import { MAX_IMAGE_BYTES } from "@/lib/nakuru/data/constants";
import { useRef, useState } from "react";

const BANNER_W = 1200;
const BANNER_H = 400;
const BANNER_RATIO = BANNER_W / BANNER_H;

type Props = {
  bannerUrl: string | null;
  disabled?: boolean;
  toast: (msg: string) => void;
  onUploaded: (bannerUrl: string) => void;
};

function cropToBannerDataUrl(im: HTMLImageElement): string {
  const c = document.createElement("canvas");
  c.width = BANNER_W;
  c.height = BANNER_H;
  const ctx = c.getContext("2d");
  if (!ctx) return "";

  const srcRatio = im.width / im.height;
  let sx: number;
  let sy: number;
  let sw: number;
  let sh: number;
  if (srcRatio > BANNER_RATIO) {
    sh = im.height;
    sw = im.height * BANNER_RATIO;
    sx = (im.width - sw) / 2;
    sy = 0;
  } else {
    sw = im.width;
    sh = im.width / BANNER_RATIO;
    sx = 0;
    sy = (im.height - sh) / 2;
  }
  ctx.drawImage(im, sx, sy, sw, sh, 0, 0, BANNER_W, BANNER_H);
  return c.toDataURL("image/jpeg", 0.85);
}

export function ShopBannerUpload({
  bannerUrl,
  disabled,
  toast,
  onUploaded,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const onPick = () => {
    if (disabled || busy) return;
    inputRef.current?.click();
  };

  const onFile = (file: File | undefined) => {
    if (!file || disabled || busy) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast("Choose a JPG, PNG or WebP image");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast("Image is too large. Max 5 MB");
      return;
    }
    const url = URL.createObjectURL(file);
    const im = new Image();
    im.onload = () => {
      URL.revokeObjectURL(url);
      const dataUrl = cropToBannerDataUrl(im);
      if (!dataUrl) {
        toast("Couldn't prepare that image. Try another.");
        return;
      }
      setBusy(true);
      void apiFetch<{ banner_url: string }>("/api/vendors/mine", {
        method: "PATCH",
        body: JSON.stringify({ bannerImageDataUrl: dataUrl }),
      })
        .then((res) => {
          onUploaded(res.banner_url);
          toast("Shop banner updated");
        })
        .catch((err) => {
          if (err instanceof ApiError && err.body.error === "no_approved_vendor") {
            toast("Your shop must be approved before adding a banner.");
          } else if (
            err instanceof ApiError &&
            err.body.error === "image_upload_failed"
          ) {
            toast("Could not upload banner. Try again shortly.");
          } else {
            toast("Could not save shop banner.");
          }
        })
        .finally(() => setBusy(false));
    };
    im.onerror = () => {
      URL.revokeObjectURL(url);
      toast("Couldn't read that image. Try another.");
    };
    im.src = url;
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        hidden
        disabled={disabled || busy}
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          onFile(f);
        }}
      />
      <button
        type="button"
        className={`shop-banner${bannerUrl ? " has-img" : ""}`}
        aria-label={bannerUrl ? "Change shop banner" : "Add shop banner"}
        disabled={disabled || busy}
        onClick={onPick}
      >
        {bannerUrl ? (
          <img src={bannerUrl} alt="" />
        ) : (
          <span className="shop-banner-placeholder">
            {busy ? "Uploading…" : "Add shop banner (optional)"}
          </span>
        )}
        <span className="shop-banner-camera" aria-hidden>
          📷
        </span>
      </button>
      <p className="m shop-banner-hint">
        Wide image, 3:1 crop. JPG, PNG, or WebP up to 5 MB. Shown on your public
        shop page.
      </p>
    </>
  );
}