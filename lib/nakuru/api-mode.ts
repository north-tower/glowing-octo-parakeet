/** True when the client points at an external API origin (not same-origin `/api`). */
export function isExternalApiMode(): boolean {
  const url = process.env.NEXT_PUBLIC_API_URL?.trim();
  const base = process.env.NEXT_PUBLIC_API_BASE?.trim();
  return Boolean(url || base);
}