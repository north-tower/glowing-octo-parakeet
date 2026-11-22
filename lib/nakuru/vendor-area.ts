export function listingAttributesWithShopArea(
  attributes: Record<string, string> | undefined,
  shopArea: string | null | undefined,
): Record<string, string> {
  const attrs = { ...(attributes ?? {}) };
  if (!attrs.location?.trim() && shopArea?.trim()) {
    attrs.location = shopArea.trim();
  }
  return attrs;
}
