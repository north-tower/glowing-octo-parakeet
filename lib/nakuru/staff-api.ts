import { ApiError, type ApiErrorBody, type ApiFetchOptions } from "@/lib/nakuru/api";
import {
  clearStaffAccessToken,
  getStaffAccessToken,
  setStaffAccessToken,
} from "@/lib/nakuru/staff-auth";

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

async function parseJsonBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function isErrorBody(v: unknown): v is ApiErrorBody {
  return (
    typeof v === "object" &&
    v !== null &&
    "error" in v &&
    typeof (v as ApiErrorBody).error === "string"
  );
}

async function refreshStaffAccessToken(): Promise<string | null> {
  const res = await fetch(resolveUrl(REFRESH_PATH), {
    method: "POST",
    credentials: "include",
    headers: { "X-Requested-With": "nakuruhub" },
  });
  if (!res.ok) {
    clearStaffAccessToken();
    return null;
  }
  const data = (await parseJsonBody(res)) as { access?: string } | null;
  if (!data?.access || typeof data.access !== "string") {
    clearStaffAccessToken();
    return null;
  }
  setStaffAccessToken(data.access);
  return data.access;
}

export async function staffFetch<T = unknown>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { skipAuthRetry = false, ...init } = options;

  const run = async (allowRefresh: boolean): Promise<T> => {
    const headers = new Headers(init.headers);
    headers.set("X-Requested-With", "nakuruhub");

    const hasBody = init.body !== undefined && init.body !== null;
    const isForm =
      typeof FormData !== "undefined" && init.body instanceof FormData;
    if (hasBody && !isForm && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const token = getStaffAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const res = await fetch(resolveUrl(path), {
      ...init,
      headers,
      credentials: init.credentials ?? "include",
    });

    if (
      res.status === 401 &&
      allowRefresh &&
      !skipAuthRetry &&
      path !== REFRESH_PATH
    ) {
      const next = await refreshStaffAccessToken();
      if (next) return run(false);
      clearStaffAccessToken();
    }

    const body = await parseJsonBody(res);

    if (!res.ok) {
      const errBody: ApiErrorBody = isErrorBody(body)
        ? body
        : { error: res.status === 401 ? "unauthorized" : "request_failed" };
      throw new ApiError(res.status, errBody);
    }

    return body as T;
  };

  return run(true);
}

export type StaffVendorRow = {
  id: string;
  name: string;
  categories: string[];
  status: string;
  verified: boolean;
  created_at: string;
  owner_email: string | null;
};