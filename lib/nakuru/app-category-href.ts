/** URL for the in-app category tab (optional drill-in `side` / listing `cat`). */
export function appCategoryHref(opts?: {
  side?: string;
  cat?: string;
}): string {
  const params = new URLSearchParams({ tab: "cat" });
  const side = opts?.side?.trim();
  if (side && side !== "feat") {
    params.set("side", side);
  }
  const cat = opts?.cat?.trim();
  if (cat && cat !== "all") {
    params.set("cat", cat);
  }
  return `/app?${params.toString()}`;
}