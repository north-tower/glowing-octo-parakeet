const ALLOWED = ["image/jpeg", "image/png", "image/webp"] as const;

export function resizeImageFile(
  file: File,
  maxPx: number,
  maxBytes: number,
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!ALLOWED.includes(file.type as (typeof ALLOWED)[number])) {
      reject(new Error("type"));
      return;
    }
    if (file.size > maxBytes) {
      reject(new Error("size"));
      return;
    }
    const url = URL.createObjectURL(file);
    const im = new Image();
    im.onload = () => {
      const scale = Math.min(1, maxPx / Math.max(im.width, im.height));
      const w = Math.max(1, Math.round(im.width * scale));
      const h = Math.max(1, Math.round(im.height * scale));
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      c.getContext("2d")?.drawImage(im, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL("image/jpeg", 0.85));
    };
    im.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("read"));
    };
    im.src = url;
  });
}