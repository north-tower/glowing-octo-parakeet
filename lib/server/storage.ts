import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { config } from "./config";

export class StorageError extends Error {
  code: string;

  constructor(code: string) {
    super(code);
    this.code = code;
  }
}

let client: SupabaseClient | null = null;

function storageClient(): SupabaseClient {
  if (!config.supabase.url || !config.supabase.serviceKey) {
    throw new StorageError("storage_not_configured");
  }
  client ??= createClient(config.supabase.url, config.supabase.serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

const PRODUCT_BUCKET = "product-images";

export function parseImageDataUrl(
  dataUrl: string,
): { bytes: Buffer; contentType: "image/jpeg" | "image/png" | "image/webp" } | null {
  const m = /^data:(image\/(?:jpeg|png|webp));base64,([\s\S]+)$/i.exec(dataUrl.trim());
  if (!m) return null;
  const contentType = m[1].toLowerCase() as "image/jpeg" | "image/png" | "image/webp";
  try {
    const bytes = Buffer.from(m[2], "base64");
    if (bytes.length < 1 || bytes.length > 5 * 1024 * 1024) return null;
    return { bytes, contentType };
  } catch {
    return null;
  }
}

export async function uploadProductImage(
  vendorId: string,
  productId: string,
  bytes: Buffer,
  contentType: "image/jpeg" | "image/png" | "image/webp",
): Promise<string> {
  const ext =
    contentType === "image/png"
      ? "png"
      : contentType === "image/webp"
        ? "webp"
        : "jpg";
  const path = `${vendorId}/${productId}.${ext}`;
  const supabase = storageClient();
  const { error } = await supabase.storage.from(PRODUCT_BUCKET).upload(path, bytes, {
    contentType,
    upsert: true,
  });
  if (error) {
    console.error("[storage] product image upload", error.message);
    throw new StorageError("upload_failed");
  }
  const { data } = supabase.storage.from(PRODUCT_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadVendorLogo(
  vendorId: string,
  bytes: Buffer,
  contentType: "image/jpeg" | "image/png" | "image/webp",
): Promise<string> {
  const ext =
    contentType === "image/png"
      ? "png"
      : contentType === "image/webp"
        ? "webp"
        : "jpg";
  const path = `vendor-logos/${vendorId}.${ext}`;
  const supabase = storageClient();
  const { error } = await supabase.storage.from(PRODUCT_BUCKET).upload(path, bytes, {
    contentType,
    upsert: true,
  });
  if (error) {
    console.error("[storage] vendor logo upload", error.message);
    throw new StorageError("upload_failed");
  }
  const { data } = supabase.storage.from(PRODUCT_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadVendorBanner(
  vendorId: string,
  bytes: Buffer,
  contentType: "image/jpeg" | "image/png" | "image/webp",
): Promise<string> {
  const ext =
    contentType === "image/png"
      ? "png"
      : contentType === "image/webp"
        ? "webp"
        : "jpg";
  const path = `vendor-banners/${vendorId}.${ext}`;
  const supabase = storageClient();
  const { error } = await supabase.storage.from(PRODUCT_BUCKET).upload(path, bytes, {
    contentType,
    upsert: true,
  });
  if (error) {
    console.error("[storage] vendor banner upload", error.message);
    throw new StorageError("upload_failed");
  }
  const { data } = supabase.storage.from(PRODUCT_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}