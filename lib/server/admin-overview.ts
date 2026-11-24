import { auditRowToJson, listAuditLog } from "./admin-audit";
import { db } from "./db";

export type AdminOverview = {
  pendingVendors: number;
  approvedVendors7d: number;
  openOrders: number;
  ordersToday: number;
  staffLoginFailures24h: number;
  recentAudit: ReturnType<typeof auditRowToJson>[];
};

export async function getAdminOverview(): Promise<AdminOverview> {
  const [
    pending,
    approved7d,
    openOrders,
    ordersToday,
    failures,
    recent,
  ] = await Promise.all([
    db.q<{ n: string }>(
      `select count(*)::text as n from vendors where status = 'pending'`,
    ),
    db.q<{ n: string }>(
      `select count(*)::text as n
       from vendors
       where status = 'approved'
         and created_at >= now() - interval '7 days'`,
    ),
    db.q<{ n: string }>(
      `select count(*)::text as n
       from orders
       where status not in ('delivered', 'cancelled', 'refused')`,
    ),
    db.q<{ n: string }>(
      `select count(*)::text as n
       from orders
       where created_at::date = current_date`,
    ),
    db.q<{ n: string }>(
      `select count(*)::text as n
       from audit_log
       where event = 'staff_login_fail'
         and at >= now() - interval '24 hours'`,
    ),
    listAuditLog({ limit: 10 }),
  ]);

  return {
    pendingVendors: Number(pending.rows[0]?.n ?? 0),
    approvedVendors7d: Number(approved7d.rows[0]?.n ?? 0),
    openOrders: Number(openOrders.rows[0]?.n ?? 0),
    ordersToday: Number(ordersToday.rows[0]?.n ?? 0),
    staffLoginFailures24h: Number(failures.rows[0]?.n ?? 0),
    recentAudit: recent.map(auditRowToJson),
  };
}