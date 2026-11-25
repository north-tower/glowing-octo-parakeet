export function listingAttributesWithShopArea(
  attributes: Record<string, string> | undefined,
  shopArea: string | null | undefined,
  shopWhatsapp?: string | null,
): Record<string, string> {
  const attrs = { ...(attributes ?? {}) };
  if (!attrs.location?.trim() && shopArea?.trim()) {
    attrs.location = shopArea.trim();
  }
  const hasContact = Boolean(
    attrs.whatsapp?.trim() || attrs.phone?.trim() || attrs.mobile?.trim(),
  );
  if (!hasContact && shopWhatsapp?.trim()) {
    attrs.whatsapp = shopWhatsapp.trim();
  }
  return attrs;
}
