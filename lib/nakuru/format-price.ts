/** Tabular price parts for listing cards (small currency prefix). */
export function formatPrice(
  amount: number,
  currency = "KES",
): { currency: string; amount: string } {
  return formatPriceParts(amount, currency);
}

export function formatPriceParts(
  amount: number,
  currency = "KES",
): { currency: string; amount: string } {
  return {
    currency,
    amount: amount.toLocaleString("en-KE"),
  };
}