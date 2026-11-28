/** Public origin of the POS app (no trailing slash). Empty if unset. */
export function posAppUrl(): string {
  const raw = process.env.NEXT_PUBLIC_POS_URL?.trim() ?? "";
  if (!raw) return "";
  return raw.replace(/\/+$/, "");
}
