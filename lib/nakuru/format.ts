export function formatKES(n: number): string {
  return `KES ${n.toLocaleString("en-KE")}`;
}

export function kes(n: number): string {
  return formatKES(n);
}

export function formatListingPrice(
  amount: number,
  opts?: { from?: boolean; suffix?: string | null },
): string {
  const body = formatKES(amount);
  const withFrom = opts?.from ? `From ${body}` : body;
  const suffix = opts?.suffix?.trim();
  return suffix ? `${withFrom} ${suffix}` : withFrom;
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