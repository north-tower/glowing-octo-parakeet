"use client";

import { useRef, type ReactNode } from "react";
import { MAX_IMAGE_BYTES } from "@/lib/nakuru/data/constants";
import { useNakuruApp } from "@/components/app/AppProvider";

type Props = {
  children: ReactNode;
  className?: string;
  role?: string;
  "aria-label"?: string;
};

export function ProfilePhotoUpload({
  children,
  className,
  role,
  "aria-label": ariaLabel,
}: Props) {
  const { dispatch, toast } = useNakuruApp();
  const inputRef = useRef<HTMLInputElement>(null);

  const onPick = () => inputRef.current?.click();

  const onFile = (file: File | undefined) => {
    if (!file) return;
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
      const c = document.createElement("canvas");
      const z = 256;
      const m = Math.min(im.width, im.height);
      c.width = z;
      c.height = z;
      c.getContext("2d")?.drawImage(
        im,
        (im.width - m) / 2,
        (im.height - m) / 2,
        m,
        m,
        0,
        0,
        z,
        z,
      );
      URL.revokeObjectURL(url);
      const photo = c.toDataURL("image/jpeg", 0.85);
      dispatch({ type: "SET_PHOTO", photo });
      toast("Profile picture updated");
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
        id="pf"
        accept="image/jpeg,image/png,image/webp"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          onFile(f);
        }}
      />
      <div
        className={className}
        role={role}
        aria-label={ariaLabel}
        tabIndex={role === "button" ? 0 : undefined}
        onClick={onPick}
        onKeyDown={(e) => {
          if (
            role === "button" &&
            (e.key === "Enter" || e.key === " ")
          ) {
            e.preventDefault();
            onPick();
          }
        }}
      >
        {children}
      </div>
    </>
  );
}

export function Avatar({ photo }: { photo: string }) {
  if (photo) {
    return <img src={photo} alt="Profile photo" />;
  }
  return <>👤</>;
}