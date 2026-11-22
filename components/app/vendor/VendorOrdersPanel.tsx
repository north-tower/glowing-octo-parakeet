"use client";

import { VendorInquiriesList } from "@/components/app/vendor/VendorInquiriesList";
import { apiFetch, ApiError } from "@/lib/nakuru/api";
import { useCallback, useEffect, useState } from "react";

type VendorOrder = {
  id: string;
  status: string;
  total: number;
  fee: number;
  payment: string;
  zone: string;
  address: string;
  createdAt: string;
  items: { title: string; qty: number; unit: number }[];
};

function statusLabel(status: string): string {
  if (status === "placed") return "New";
  if (status === "accepted") return "Accepted";
  if (status === "ready") return "Ready";
  if (status === "out_for_delivery") return "Out for delivery";
  if (status === "delivered") return "Delivered";
  if (status === "cancelled") return "Cancelled";
  return status;
}

type Props = {
  toast: (msg: string) => void;
};

export function VendorOrdersPanel({ toast }: Props) {
  const [orders, setOrders] = useState<VendorOrder[] | null>(null);
  const [error, setError] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await apiFetch<{ orders: VendorOrder[] }>("/api/vendor/orders");
      setOrders(data.orders ?? []);
      setError(false);
    } catch {
      setOrders([]);
      setError(true);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const setStatus = async (
    orderId: string,
    status: "accepted" | "ready" | "cancelled",
  ) => {
    if (busyId) return;
    setBusyId(orderId);
    try {
      await apiFetch("/api/vendor/orders", {
        method: "POST",
        body: JSON.stringify({ orderId, status }),
      });
      toast(
        status === "cancelled"
          ? "Order cancelled."
          : status === "ready"
            ? "Marked ready for pickup."
            : "Order accepted.",
      );
      await load();
    } catch (err) {
      if (err instanceof ApiError && err.body.error === "not_found") {
        toast("Order not found.");
      } else {
        toast("Could not update that order.");
      }
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <div className="card">
        <div className="row sp">
          <div className="t">Orders</div>
          <button type="button" className="btn s" onClick={() => void load()}>
            Refresh
          </button>
        </div>
        {orders === null ? (
          <div className="m">Loading orders…</div>
        ) : error ? (
          <>
            <div className="warn">Could not load orders.</div>
            <button type="button" className="btn s" onClick={() => void load()}>
              Retry
            </button>
          </>
        ) : orders.length === 0 ? (
          <div className="m">No orders yet. They appear here when a buyer pays on delivery.</div>
        ) : (
          <ul className="shop-stock-list">
            {orders.map((order) => (
              <li key={order.id} className="shop-stock-row">
                <div className="shop-stock-title">
                  {statusLabel(order.status)} · KES {order.total.toLocaleString()}
                </div>
                <div className="m">
                  {order.zone} · {order.address}
                </div>
                <div className="m">
                  {order.items
                    .map((item) => `${item.qty}× ${item.title}`)
                    .join(", ")}
                </div>
                {order.status === "placed" || order.status === "accepted" ? (
                  <div className="listing-photo-row">
                    {order.status === "placed" ? (
                      <button
                        type="button"
                        className="btn s"
                        disabled={busyId === order.id}
                        onClick={() => void setStatus(order.id, "accepted")}
                      >
                        Accept
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn s"
                        disabled={busyId === order.id}
                        onClick={() => void setStatus(order.id, "ready")}
                      >
                        Mark ready
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn s"
                      disabled={busyId === order.id}
                      onClick={() => void setStatus(order.id, "cancelled")}
                    >
                      Cancel
                    </button>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
      <VendorInquiriesList />
    </>
  );
}
