/** POST /api/auth/refresh with credentials — shared single-flight for customer + staff. */

function apiBase(): string {
  const raw = process.env.NEXT_PUBLIC_API_BASE ?? "";
  return raw.replace(/\/$/, "");
}

function resolveUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  const base = apiBase();
  return base ? `${base}${p}` : p;
}

const REFRESH_PATH = "/api/auth/refresh";

let refreshInFlight: Promise<string | null> | null = null;

async function postRefreshCookie(): Promise<string | null> {
  const res = await fetch(resolveUrl(REFRESH_PATH), {
    method: "POST",
    credentials: "include",
    headers: {
      "X-Requested-With": "nakuruhub",
    },
  });
  if (!res.ok) return null;
  const text = await res.text();
  if (!text) return null;
  try {
    const data = JSON.parse(text) as { access?: string };
    return typeof data.access === "string" ? data.access : null;
  } catch {
    return null;
  }
}

export function refreshAccessFromCookie(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = postRefreshCookie().finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
}