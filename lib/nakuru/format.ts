export function formatKES(n: number): string {
  return `KES ${n.toLocaleString("en-KE")}`;
}

export function kes(n: number): string {
  return formatKES(n);
}

export function formatListingPrice(
  amount: number,
  opts?: { from?: boolean },
): string {
  const body = formatKES(amount);
  return opts?.from ? `From ${body}` : body;
}

/** Escape for rare residual HTML strings; React children do not need this. */
export function esc(s: string): string {
  return String(s).replace(/[&<>"']/g, (c) => {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return map[c] ?? c;
  });
}