import { ApiError, type ApiErrorBody, type ApiFetchOptions } from "@/lib/nakuru/api";
import type { ListingMode } from "@/lib/nakuru/types";
import { refreshAccessFromCookie } from "@/lib/nakuru/session-refresh";
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
  const access = await refreshAccessFromCookie();
  if (!access) {
    clearStaffAccessToken();
    return null;
  }
  setStaffAccessToken(access);
  return access;
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

export type StaffCategoryRow = {
  slug: string;
  label: string;
  kind: "official" | "community";
  listingMode: ListingMode;
  openForApply: boolean;
  sortOrder: number;
  visible: boolean;
  parentSlug: string | null;
  depth: number;
  hasChildren: boolean;
  createdAt: string;
  createdBy: string | null;
};

export type StaffVendorRow = {
  id: string;
  name: string;
  categories: string[];
  status: string;
  verified: boolean;
  logo_url: string | null;
  created_at: string;
  owner_email: string | null;
};

export type StaffMe = {
  id: string;
  email: string;
  role: "admin" | "support";
};

export type StaffAuditRow = {
  id: number;
  at: string;
  event: string;
  userId: string | null;
  actorEmail: string | null;
  ip: string | null;
  meta: Record<string, unknown>;
};

export type StaffAuditPage = {
  rows: StaffAuditRow[];
  nextCursor: string | null;
};

export type StaffOrderRow = {
  id: string;
  status: string;
  totalKes: number;
  deliveryFeeKes: number;
  payment: string;
  paymentStatus: string;
  zone: string | null;
  address: string | null;
  createdAt: string;
  customerId: string;
  customerEmail: string | null;
  vendorId: string | null;
  vendorName: string | null;
  itemCount: number;
};

export type StaffOrdersPage = {
  rows: StaffOrderRow[];
  nextCursor: string | null;
};

export type StaffOrderItemRow = {
  productId: string;
  title: string;
  unitKes: number;
  qty: number;
};

export type StaffInquiryRow = {
  id: string;
  status: string;
  message: string;
  createdAt: string;
  customerId: string;
  customerEmail: string | null;
  productId: string;
  productTitle: string;
  vendorId: string;
  vendorName: string;
};

export type StaffInquiriesPage = {
  rows: StaffInquiryRow[];
  nextCursor: string | null;
};

export type StaffOverview = {
  pendingVendors: number;
  approvedVendors7d: number;
  openOrders: number;
  ordersToday: number;
  staffLoginFailures24h: number;
  recentAudit: StaffAuditRow[];
};