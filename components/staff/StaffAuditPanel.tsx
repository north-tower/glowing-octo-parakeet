"use client";

import { ApiError } from "@/lib/nakuru/api";
import {
  clearStaffAccessToken,
  getStaffAccessToken,
} from "@/lib/nakuru/staff-auth";
import { staffFetch, type StaffAuditPage, type StaffAuditRow } from "@/lib/nakuru/staff-api";
import { CardRowsSkeleton } from "@/components/app/loading/LoadingUi";
import { useCallback, useEffect, useState, type FormEvent } from "react";

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

function shortIp(ip: string | null): string {
  if (!ip) return "—";
  if (ip.length > 24) return `${ip.slice(0, 20)}…`;
  return ip;
}

export function StaffAuditPanel() {
  const [rows, setRows] = useState<StaffAuditRow[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [eventFilter, setEventFilter] = useState("");
  const [appliedEvent, setAppliedEvent] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchPage = useCallback(
    async (opts: { cursor?: string | null; append: boolean }) => {
      if (!getStaffAccessToken()) return;
      const params = new URLSearchParams({ limit: "50" });
      if (opts.cursor) params.set("cursor", opts.cursor);
      if (appliedEvent) params.set("event", appliedEvent);

      if (opts.append) setLoadingMore(true);
      else setLoading(true);
      setError(null);

      try {
        const page = await staffFetch<StaffAuditPage>(
          `/api/admin/audit?${params.toString()}`,
        );
        setRows((prev) => (opts.append ? [...prev, ...page.rows] : page.rows));
        setNextCursor(page.nextCursor);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          clearStaffAccessToken();
          window.location.reload();
          return;
        }
        setError(err instanceof ApiError ? err.message : "Could not load audit log.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [appliedEvent],
  );

  useEffect(() => {
    void fetchPage({ append: false });
  }, [fetchPage]);

  const applyFilter = (ev: FormEvent) => {
    ev.preventDefault();
    setAppliedEvent(eventFilter.trim());
  };

  const loadMore = () => {
    if (!nextCursor || loadingMore) return;
    void fetchPage({ cursor: nextCursor, append: true });
  };

  if (loading) return <CardRowsSkeleton count={5} />;

  return (
    <>
      <h2 style={{ marginTop: 0 }}>Audit log</h2>
      <form className="row" style={{ flexWrap: "wrap", marginBottom: 10 }} onSubmit={applyFilter}>
        <label className="m" htmlFor="audit-event">
          Event prefix
        </label>
        <input
          id="audit-event"
          type="text"
          value={eventFilter}
          onChange={(e) => setEventFilter(e.target.value)}
          placeholder="vendor_"
          style={{ maxWidth: 160 }}
        />
        <button type="submit" className="btn s">
          Filter
        </button>
        {appliedEvent ? (
          <button
            type="button"
            className="btn s o"
            onClick={() => {
              setEventFilter("");
              setAppliedEvent("");
            }}
          >
            Clear
          </button>
        ) : null}
      </form>
      {error ? <div className="err">{error}</div> : null}
      {rows.length === 0 ? (
        <div className="card m">No matching events.</div>
      ) : (
        <div className="staff-ops-audit-table card" style={{ padding: 0, overflowX: "auto" }}>
          <table className="staff-ops-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Event</th>
                <th>Actor</th>
                <th>IP</th>
                <th>Meta</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{formatWhen(row.at)}</td>
                  <td>{row.event}</td>
                  <td>{row.actorEmail ?? "—"}</td>
                  <td>{shortIp(row.ip)}</td>
                  <td>
                    <button
                      type="button"
                      className="btn s o"
                      onClick={() =>
                        setExpandedId((id) => (id === row.id ? null : row.id))
                      }
                    >
                      {expandedId === row.id ? "Hide" : "Show"}
                    </button>
                    {expandedId === row.id ? (
                      <pre className="staff-ops-meta">{JSON.stringify(row.meta, null, 2)}</pre>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {nextCursor ? (
        <button
          type="button"
          className="btn s"
          style={{ marginTop: 12 }}
          disabled={loadingMore}
          onClick={loadMore}
        >
          {loadingMore ? "Loading…" : "Load more"}
        </button>
      ) : null}
    </>
  );
}