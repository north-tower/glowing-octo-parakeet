"use client";

import { ApiError } from "@/lib/nakuru/api";
import {
  clearStaffAccessToken,
  getStaffAccessToken,
} from "@/lib/nakuru/staff-auth";
import { staffFetch, type StaffVendorRow } from "@/lib/nakuru/staff-api";
import { useCallback, useEffect, useState } from "react";

type StatusFilter = "pending" | "approved" | "rejected";

type Props = {
  onSessionLost: () => void;
};

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

export function StaffVendorQueue({ onSessionLost }: Props) {
  const [status, setStatus] = useState<StatusFilter>("pending");
  const [rows, setRows] = useState<StaffVendorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!getStaffAccessToken()) {
      onSessionLost();
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await staffFetch<StaffVendorRow[]>(
        `/api/admin/vendors?status=${status}`,
      );
      setRows(data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        clearStaffAccessToken();
        onSessionLost();
        return;
      }
      setError(err instanceof ApiError ? err.message : "Could not load queue.");
    } finally {
      setLoading(false);
    }
  }, [onSessionLost, status]);

  useEffect(() => {
    void load();
  }, [load]);

  const act = async (id: string, action: "approve" | "reject" | "verify") => {
    setBusyId(id);
    setError(null);
    try {
      await staffFetch(`/api/admin/vendors/${id}/${action}`, {
        method: "POST",
      });
      await load();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        clearStaffAccessToken();
        onSessionLost();
        return;
      }
      setError(err instanceof ApiError ? err.message : "Action failed.");
    } finally {
      setBusyId(null);
    }
  };

  const signOut = () => {
    clearStaffAccessToken();
    void fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    }).finally(() => onSessionLost());
  };

  return (
    <>
      <div className="row sp" style={{ marginBottom: 8 }}>
        <h2 style={{ margin: 0 }}>Vendor queue</h2>
        <button type="button" className="btn s o" onClick={signOut}>
          Sign out
        </button>
      </div>
      <p className="m" style={{ marginTop: 0 }}>
        Review applications verified by email OTP. Documents UI ships in a later
        phase.
      </p>
      <div className="row" style={{ flexWrap: "wrap", marginBottom: 10 }}>
        {(
          [
            ["pending", "Pending"],
            ["approved", "Approved"],
            ["rejected", "Rejected"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={`chip${status === key ? " on" : ""}`}
            onClick={() => setStatus(key)}
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          className="btn s o"
          onClick={() => void load()}
          disabled={loading}
        >
          Refresh
        </button>
      </div>
      {error ? <div className="err">{error}</div> : null}
      {loading ? (
        <div className="m">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="card m">No {status} applications.</div>
      ) : (
        rows.map((v) => (
          <VendorQueueCard
            key={v.id}
            v={v}
            busy={busyId === v.id}
            onApprove={() => void act(v.id, "approve")}
            onReject={() => void act(v.id, "reject")}
            onVerify={() => void act(v.id, "verify")}
            formatWhen={formatWhen}
          />
        ))
      )}
    </>
  );
}

function VendorQueueCard({
  v,
  busy,
  onApprove,
  onReject,
  onVerify,
  formatWhen,
}: {
  v: StaffVendorRow;
  busy: boolean;
  onApprove: () => void;
  onReject: () => void;
  onVerify: () => void;
  formatWhen: (iso: string) => string;
}) {
  return (
    <div className="card">
      <div className="row" style={{ gap: 12, alignItems: "flex-start" }}>
        {v.logo_url ? (
          <img
            src={v.logo_url}
            alt=""
            width={48}
            height={48}
            style={{ borderRadius: 8, objectFit: "cover" }}
          />
        ) : null}
        <div style={{ flex: 1, minWidth: 0 }}>
      <div className="t">{v.name}</div>
      <div className="m">
        {v.owner_email ?? "(no email)"} · {v.categories.join(", ")}
      </div>
      <div className="m">
        Applied {formatWhen(v.created_at)}
        {v.verified ? " · Verified badge" : ""}
      </div>
      <div className="row" style={{ marginTop: 8, flexWrap: "wrap" }}>
        {v.status === "pending" ? (
          <>
            <button
              type="button"
              className="btn s"
              disabled={busy}
              onClick={onApprove}
            >
              Approve
            </button>
            <button
              type="button"
              className="btn s o"
              disabled={busy}
              onClick={onReject}
            >
              Reject
            </button>
          </>
        ) : null}
        {v.status === "approved" && !v.verified ? (
          <button
            type="button"
            className="btn s"
            disabled={busy}
            onClick={onVerify}
          >
            Grant Verified
          </button>
        ) : null}
        {v.status === "rejected" ? (
          <span className="m">Rejected — no actions</span>
        ) : null}
      </div>
        </div>
      </div>
    </div>
  );
}