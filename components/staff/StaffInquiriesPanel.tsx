"use client";

import { ApiError } from "@/lib/nakuru/api";
import {
  clearStaffAccessToken,
  getStaffAccessToken,
} from "@/lib/nakuru/staff-auth";
import {
  staffFetch,
  type StaffInquiriesPage,
  type StaffInquiryRow,
} from "@/lib/nakuru/staff-api";
import { CardRowsSkeleton } from "@/components/app/loading/LoadingUi";
import { useCallback, useEffect, useState } from "react";

type InquiryFilter = "all" | "open" | "closed";

const FILTERS: { key: InquiryFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "closed", label: "Closed" },
];

function formatWhen(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-KE", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function queryForFilter(filter: InquiryFilter): string {
  const params = new URLSearchParams({ limit: "50" });
  if (filter !== "all") params.set("status", filter);
  return params.toString();
}

export function StaffInquiriesPanel() {
  const [filter, setFilter] = useState<InquiryFilter>("open");
  const [rows, setRows] = useState<StaffInquiryRow[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchPage = useCallback(
    async (opts: { cursor?: string | null; append: boolean }) => {
      if (!getStaffAccessToken()) return;
      const q = new URLSearchParams(queryForFilter(filter));
      if (opts.cursor) q.set("cursor", opts.cursor);
      const url = `/api/admin/inquiries?${q.toString()}`;

      if (opts.append) setLoadingMore(true);
      else setLoading(true);
      setError(null);

      try {
        const page = await staffFetch<StaffInquiriesPage>(url);
        setRows((prev) => (opts.append ? [...prev, ...page.rows] : page.rows));
        setNextCursor(page.nextCursor);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          clearStaffAccessToken();
          window.location.reload();
          return;
        }
        setError(
          err instanceof ApiError ? err.message : "Could not load inquiries.",
        );
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [filter],
  );

  useEffect(() => {
    void fetchPage({ append: false });
  }, [fetchPage]);

  const q = search.trim().toLowerCase();
  const visible = q
    ? rows.filter(
        (r) =>
          r.productTitle.toLowerCase().includes(q) ||
          r.vendorName.toLowerCase().includes(q) ||
          (r.customerEmail ?? "").toLowerCase().includes(q) ||
          r.message.toLowerCase().includes(q),
      )
    : rows;

  if (loading) return <CardRowsSkeleton count={4} />;

  return (
    <>
      <h2 style={{ marginTop: 0 }}>Service inquiries</h2>
      <p className="m" style={{ marginTop: 0 }}>
        Quote and viewing requests on service listings. Vendors follow up from
        their dashboard; this queue is read-only for staff.
      </p>
      <div className="row" style={{ flexWrap: "wrap", marginBottom: 10, gap: 6 }}>
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            className={`chip${filter === key ? " on" : ""}`}
            onClick={() => setFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>
      <label htmlFor="inquiry-search">Search loaded rows</label>
      <input
        id="inquiry-search"
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Listing, vendor, email, message…"
        style={{ marginBottom: 10 }}
      />
      {error ? <div className="err">{error}</div> : null}
      {visible.length === 0 ? (
        <div className="card m">
          {rows.length === 0
            ? "No inquiries for this filter."
            : "Nothing matches your search."}
        </div>
      ) : (
        visible.map((row) => (
          <div key={row.id} className="card staff-ops-order-card">
            <div className="row sp" style={{ flexWrap: "wrap", gap: 8 }}>
              <div>
                <div className="t">{row.productTitle}</div>
                <div className="m">
                  {formatWhen(row.createdAt)} · {row.status}
                </div>
              </div>
              <div className="m" style={{ textAlign: "right" }}>
                Vendor: <strong>{row.vendorName}</strong>
              </div>
            </div>
            <div className="m" style={{ marginTop: 6 }}>
              Customer:{" "}
              {row.customerEmail ? (
                <a href={`mailto:${row.customerEmail}`}>{row.customerEmail}</a>
              ) : (
                <code style={{ fontSize: 12 }}>{row.customerId}</code>
              )}
            </div>
            {row.message ? (
              <p
                className="m staff-ops-inquiry-msg"
                style={{ whiteSpace: "pre-wrap", marginTop: 8 }}
              >
                {row.message}
              </p>
            ) : (
              <p className="m" style={{ marginTop: 8, opacity: 0.8 }}>
                (No message)
              </p>
            )}
            <div className="m" style={{ fontSize: 12, marginTop: 8 }}>
              Inquiry{" "}
              <code style={{ wordBreak: "break-all" }}>{row.id}</code>
            </div>
          </div>
        ))
      )}
      {nextCursor ? (
        <button
          type="button"
          className="btn s"
          style={{ marginTop: 12 }}
          disabled={loadingMore}
          onClick={() => void fetchPage({ cursor: nextCursor, append: true })}
        >
          {loadingMore ? "Loading…" : "Load more"}
        </button>
      ) : null}
    </>
  );
}