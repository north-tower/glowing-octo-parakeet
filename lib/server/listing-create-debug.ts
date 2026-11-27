/** Temporary diagnostics for listing publish. Search logs for `[listing-create]`. */

const PREFIX = "[listing-create]";

export function listingCreateDebug(
  step: string,
  data: Record<string, unknown> = {},
): void {
  if (process.env.VITEST) return;
  console.info(PREFIX, step, data);
}

export function listingCreateError(step: string, err: unknown): void {
  if (process.env.VITEST) return;
  const e = err instanceof Error ? err : new Error(String(err));
  console.error(PREFIX, step, {
    name: e.name,
    message: e.message,
    stack: e.stack,
  });
}

export function summarizeCreateBody(body: unknown): Record<string, unknown> {
  if (!body || typeof body !== "object") {
    return { bodyType: typeof body };
  }
  const b = body as Record<string, unknown>;
  const image =
    typeof b.imageDataUrl === "string" ? b.imageDataUrl : null;
  return {
    vendorId: b.vendorId ?? null,
    category: b.category ?? null,
    titleLen: typeof b.title === "string" ? b.title.length : null,
    descLen: typeof b.description === "string" ? b.description.length : null,
    emoji: b.emoji ?? null,
    emojiLen: typeof b.emoji === "string" ? b.emoji.length : null,
    price: b.price ?? null,
    priceType: typeof b.price,
    stock: b.stock ?? null,
    hasImage: Boolean(image),
    imageChars: image?.length ?? 0,
    extraKeys: Object.keys(b).filter(
      (k) =>
        ![
          "vendorId",
          "category",
          "title",
          "description",
          "emoji",
          "imageDataUrl",
          "price",
          "stock",
        ].includes(k),
    ),
  };
}
