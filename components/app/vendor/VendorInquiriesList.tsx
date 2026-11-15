"use client";

import { apiFetch } from "@/lib/nakuru/api";
import type { VendorInquiryRow } from "@/lib/nakuru/inquiries";
import { useCallback, useEffect, useState } from "react";

function formatWhen(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export function VendorInquiriesList() {
  const [rows, setRows] = useState<VendorInquiryRow[] | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await apiFetch<{ inquiries: VendorInquiryRow[] }>(
        "/api/vendor/inquiries",
      );
      setRows(data.inquiries ?? []);
      setError(false);
    } catch {
      setRows([]);
      setError(true);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const open =
    rows?.filter((r) => r.status === "open").sort(
      (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
    ) ?? [];
  const closed =
    rows?.filter((r) => r.status !== "open").sort(
      (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
    ) ?? [];

  return (
    <div className="card">
      <div className="row sp">
        <div className="t">Quote requests</div>
        <button type="button" className="btn s" onClick={() => void load()}>
          Refresh
        </button>
      </div>
      {rows === null ? (
        <div className="m">Loading inquiries…</div>
      ) : error ? (
        <>
          <div className="warn">Could not load quote requests.</div>
          <button type="button" className="btn s" onClick={() => void load()}>
            Retry
          </button>
        </>
      ) : rows.length === 0 ? (
        <div className="m">
          No quote requests yet. They appear here when customers tap Request
          quote on your services.
        </div>
      ) : (
        <>
          {open.length ? (
            <>
              <h2 style={{ fontSize: 15, margin: "12px 0 6px" }}>Open</h2>
              {open.map((row) => (
                <InquiryRow key={row.id} row={row} />
              ))}
            </>
          ) : (
            <div className="m">No open requests right now.</div>
          )}
          {closed.length ? (
            <>
              <h2 style={{ fontSize: 15, margin: "14px 0 6px" }}>Closed</h2>
              {closed.map((row) => (
                <InquiryRow key={row.id} row={row} />
              ))}
            </>
          ) : null}
        </>
      )}
    </div>
  );
}

function InquiryRow({ row }: { row: VendorInquiryRow }) {
  const isOpen = row.status === "open";
  return (
    <div
      className="card"
      style={{
        marginBottom: 8,
        padding: 10,
        borderColor: isOpen ? "var(--pri)" : undefined,
      }}
    >
      <div className="row sp">
        <div className="t">{row.productTitle}</div>
        <span className={`badge${isOpen ? "" : " u"}`}>
          {isOpen ? "Open" : "Closed"}
        </span>
      </div>
      <div className="m" style={{ marginTop: 4 }}>
        {row.customerEmail ? (
          <>Customer: {row.customerEmail}</>
        ) : (
          <>Customer email on file</>
        )}{" "}
        · {formatWhen(row.createdAt)}
      </div>
      {row.message ? (
        <div style={{ marginTop: 8, fontSize: 14, whiteSpace: "pre-wrap" }}>
          {row.message}
        </div>
      ) : (
        <div className="m" style={{ marginTop: 6 }}>
          (No message)
        </div>
      )}
    </div>
  );
}