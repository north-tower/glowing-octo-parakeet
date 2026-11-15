export function kes(n: number): string {
  return `KES ${n.toLocaleString("en-KE")}`;
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