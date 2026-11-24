"use client";

import { ApiError } from "@/lib/nakuru/api";
import { kes } from "@/lib/nakuru/format";
import {
  clearStaffAccessToken,
  getStaffAccessToken,
} from "@/lib/nakuru/staff-auth";
import {
  staffFetch,
  type StaffOrderItemRow,
  type StaffOrderRow,
  type StaffOrdersPage,
} from "@/lib/nakuru/staff-api";
import { CardRowsSkeleton } from "@/components/app/loading/LoadingUi";
import { useCallback, useEffect, useState } from "react";

type OrderFilter =
  | "all"
  | "open"
  | "placed"
  | "accepted"
  | "ready"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

const FILTERS: { key: OrderFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "placed", label: "Placed" },
  { key: "accepted", label: "Accepted" },
  { key: "ready", label: "Ready" },
  { key: "out_for_delivery", label: "Out for delivery" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
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

function statusLabel(status: string): string {
  return status.replaceAll("_", " ");
}

function queryForFilter(filter: OrderFilter): string {
  const params = new URLSearchParams({ limit: "50" });
  if (filter === "open") params.set("filter", "open");
  else if (filter !== "all") params.set("status", filter);
  return params.toString();
}

export function StaffOrdersPanel() {
  const [filter, setFilter] = useState<OrderFilter>("open");
  const [rows, setRows] = useState<StaffOrderRow[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [itemsByOrder, setItemsByOrder] = useState<
    Record<string, StaffOrderItemRow[]>
  >({});
  const [itemsLoading, setItemsLoading] = useState<string | null>(null);

  const fetchPage = useCallback(
    async (opts: { cursor?: string | null; append: boolean }) => {
      if (!getStaffAccessToken()) return;
      const params = queryForFilter(filter);
      const q = new URLSearchParams(params);
      if (opts.cursor) q.set("cursor", opts.cursor);
      const url = `/api/admin/orders?${q.toString()}`;

      if (opts.append) setLoadingMore(true);
      else setLoading(true);
      setError(null);

      try {
        const page = await staffFetch<StaffOrdersPage>(url);
        setRows((prev) => (opts.append ? [...prev, ...page.rows] : page.rows));
        setNextCursor(page.nextCursor);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          clearStaffAccessToken();
          window.location.reload();
          return;
        }
        setError(err instanceof ApiError ? err.message : "Could not load orders.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [filter],
  );

  useEffect(() => {
    setExpandedId(null);
    void fetchPage({ append: false });
  }, [fetchPage]);

  const toggleItems = async (orderId: string) => {
    if (expandedId === orderId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(orderId);
    if (itemsByOrder[orderId]) return;
    setItemsLoading(orderId);
    try {
      const data = await staffFetch<{ items: StaffOrderItemRow[] }>(
        `/api/admin/orders/${encodeURIComponent(orderId)}/items`,
      );
      setItemsByOrder((prev) => ({ ...prev, [orderId]: data.items }));
    } catch {
      setItemsByOrder((prev) => ({ ...prev, [orderId]: [] }));
    } finally {
      setItemsLoading(null);
    }
  };

  if (loading) return <CardRowsSkeleton count={5} />;

  return (
    <>
      <h2 style={{ marginTop: 0 }}>Orders</h2>
      <p className="m" style={{ marginTop: 0 }}>
        Shop checkout orders across vendors. Delivery PINs stay with customer and
        vendor apps — not shown here.
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
      {error ? <div className="err">{error}</div> : null}
      {rows.length === 0 ? (
        <div className="card m">No orders for this filter.</div>
      ) : (
        rows.map((row) => (
          <div key={row.id} className="card staff-ops-order-card">
            <div className="row sp" style={{ flexWrap: "wrap", gap: 8 }}>
              <div>
                <div className="t">{kes(row.totalKes)}</div>
                <div className="m">
                  {formatWhen(row.createdAt)} · {statusLabel(row.status)}
                </div>
              </div>
              <div className="m staff-ops-order-meta" style={{ textAlign: "right" }}>
                {row.payment.toUpperCase()} · {row.paymentStatus}
              </div>
            </div>
            <div className="m" style={{ marginTop: 6 }}>
              Customer:{" "}
              {row.customerEmail ? (
                <a href={`mailto:${row.customerEmail}`}>{row.customerEmail}</a>
              ) : (
                <code style={{ fontSize: 12 }}>{row.customerId}</code>
              )}
              {row.vendorName ? (
                <>
                  {" "}
                  · Vendor: <strong>{row.vendorName}</strong>
                </>
              ) : null}
            </div>
            {row.zone || row.address ? (
              <div className="m">
                {row.zone ? `${row.zone} · ` : ""}
                {row.address ?? ""}
              </div>
            ) : null}
            <div className="m" style={{ fontSize: 12 }}>
              Order{" "}
              <code style={{ wordBreak: "break-all" }}>{row.id}</code>
              {row.itemCount > 0 ? ` · ${row.itemCount} line item(s)` : null}
            </div>
            <button
              type="button"
              className="btn s o"
              style={{ marginTop: 8 }}
              onClick={() => void toggleItems(row.id)}
            >
              {expandedId === row.id ? "Hide items" : "View items"}
            </button>
            {expandedId === row.id ? (
              <div className="staff-ops-order-items">
                {itemsLoading === row.id ? (
                  <p className="m">Loading items…</p>
                ) : (itemsByOrder[row.id] ?? []).length === 0 ? (
                  <p className="m">No line items.</p>
                ) : (
                  <ul className="m" style={{ margin: "8px 0 0", paddingLeft: 18 }}>
                    {(itemsByOrder[row.id] ?? []).map((item) => (
                      <li key={item.productId}>
                        {item.qty}× {item.title} @ {kes(item.unitKes)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : null}
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