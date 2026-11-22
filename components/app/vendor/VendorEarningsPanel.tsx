"use client";

import { apiFetch } from "@/lib/nakuru/api";
import { useCallback, useEffect, useState } from "react";

type Earnings = {
  deliveredCount: number;
  goodsTotal: number;
  codTotal: number;
  mpesaTotal: number;
};

export function VendorEarningsPanel() {
  const [data, setData] = useState<Earnings | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    try {
      const row = await apiFetch<Earnings>("/api/vendor/earnings");
      setData(row);
      setError(false);
    } catch {
      setData(null);
      setError(true);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="card">
      <div className="row sp">
        <div className="t">Earnings</div>
        <button type="button" className="btn s" onClick={() => void load()}>
          Refresh
        </button>
      </div>
      <div className="m">Totals from delivered orders. Payouts are not in this screen yet.</div>
      {data === null && !error ? (
        <div className="m">Loading earnings…</div>
      ) : error ? (
        <>
          <div className="warn">Could not load earnings.</div>
          <button type="button" className="btn s" onClick={() => void load()}>
            Retry
          </button>
        </>
      ) : data && data.deliveredCount === 0 ? (
        <div className="m">Nothing delivered yet. Earnings appear after an order is completed.</div>
      ) : data ? (
        <div className="shop-earn-grid">
          <div className="shop-earn-tile">
            <b>{data.deliveredCount}</b>
            <span>Delivered</span>
          </div>
          <div className="shop-earn-tile">
            <b>KES {data.goodsTotal.toLocaleString()}</b>
            <span>Goods total</span>
          </div>
          <div className="shop-earn-tile">
            <b>KES {data.codTotal.toLocaleString()}</b>
            <span>Cash on delivery</span>
          </div>
          <div className="shop-earn-tile">
            <b>KES {data.mpesaTotal.toLocaleString()}</b>
            <span>M-Pesa</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
