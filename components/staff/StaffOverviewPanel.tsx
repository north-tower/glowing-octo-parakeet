"use client";

import { ApiError } from "@/lib/nakuru/api";
import {
  clearStaffAccessToken,
  getStaffAccessToken,
} from "@/lib/nakuru/staff-auth";
import { staffFetch, type StaffOverview } from "@/lib/nakuru/staff-api";
import { CardRowsSkeleton } from "@/components/app/loading/LoadingUi";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

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

export function StaffOverviewPanel() {
  const [data, setData] = useState<StaffOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!getStaffAccessToken()) return;
    setLoading(true);
    setError(null);
    try {
      const row = await staffFetch<StaffOverview>("/api/admin/overview");
      setData(row);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        clearStaffAccessToken();
        window.location.reload();
        return;
      }
      setError(err instanceof ApiError ? err.message : "Could not load overview.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <CardRowsSkeleton count={3} />;
  if (error) return <div className="err">{error}</div>;
  if (!data) return null;

  return (
    <>
      <h2 style={{ marginTop: 0 }}>Overview</h2>
      <div className="card row staff-ops-stats">
        <StatCard label="Pending vendors" value={data.pendingVendors} />
        <StatCard label="Approved (7d)" value={data.approvedVendors7d} />
        <StatCard label="Open orders" value={data.openOrders} />
        <StatCard label="Orders today" value={data.ordersToday} />
        <StatCard label="Staff login fails (24h)" value={data.staffLoginFailures24h} />
      </div>
      <p className="row sp" style={{ alignItems: "center" }}>
        <span className="t">Recent activity</span>
        <Link href="/staff/audit" className="btn s o">
          View all
        </Link>
      </p>
      {data.recentAudit.length === 0 ? (
        <div className="card m">No audit events yet.</div>
      ) : (
        data.recentAudit.map((row) => (
          <div key={row.id} className="card staff-ops-audit-teaser">
            <div className="t">{row.event}</div>
            <div className="m">
              {formatWhen(row.at)} · {row.actorEmail ?? "—"}
            </div>
          </div>
        ))
      )}
    </>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="stat">
      <b>{value}</b>
      <span className="m">{label}</span>
    </div>
  );
}