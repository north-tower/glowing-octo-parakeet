import { audit } from "./audit";
import { db } from "./db";
import { OrderError, restock } from "./orders";

export type VendorOrderRow = {
  id: string;
  status: string;
  total: number;
  fee: number;
  payment: string;
  paymentStatus: string;
  zone: string;
  address: string;
  createdAt: string;
  items: { productId: string; title: string; unit: number; qty: number }[];
};

const ALLOWED: Record<string, string[]> = {
  placed: ["accepted", "cancelled"],
  accepted: ["ready", "cancelled"],
};

export async function listVendorOrders(
  ownerId: string,
): Promise<VendorOrderRow[]> {
  const rows = (
    await db.q<{
      id: string;
      status: string;
      total_kes: number;
      delivery_fee_kes: number;
      payment: string;
      payment_status: string;
      zone: string;
      address: string;
      created_at: Date;
    }>(
      `select o.id, o.status, o.total_kes, o.delivery_fee_kes, o.payment,
              o.payment_status, o.zone, o.address, o.created_at
       from orders o
       join vendors v on v.id = o.vendor_id
       where v.owner_id = $1
       order by o.created_at desc
       limit 50`,
      [ownerId],
    )
  ).rows;

  if (!rows.length) return [];

  const ids = rows.map((o) => o.id);
  const itemRows = (
    await db.q<{
      order_id: string;
      product_id: string;
      title: string;
      unit_kes: number;
      qty: number;
    }>(
      `select order_id, product_id, title, unit_kes, qty
       from order_items
       where order_id = any($1::uuid[])`,
      [ids],
    )
  ).rows;

  const byOrder: Record<string, VendorOrderRow["items"]> = {};
  for (const r of itemRows) {
    (byOrder[r.order_id] ??= []).push({
      productId: r.product_id,
      title: r.title,
      unit: r.unit_kes,
      qty: r.qty,
    });
  }

  return rows.map((o) => ({
    id: o.id,
    status: o.status,
    total: o.total_kes,
    fee: o.delivery_fee_kes,
    payment: o.payment,
    paymentStatus: o.payment_status,
    zone: o.zone,
    address: o.address,
    createdAt: o.created_at.toISOString(),
    items: byOrder[o.id] ?? [],
  }));
}

export async function updateVendorOrderStatus(
  ownerId: string,
  orderId: string,
  status: "accepted" | "ready" | "cancelled",
  ip: string | null,
): Promise<void> {
  await db.tx(async (cl) => {
    const cur = (
      await cl.query<{ id: string; status: string }>(
        `select o.id, o.status
         from orders o
         join vendors v on v.id = o.vendor_id
         where o.id = $1 and v.owner_id = $2
         for update of o`,
        [orderId, ownerId],
      )
    ).rows[0];
    if (!cur) {
      throw new OrderError(404, "not_found");
    }
    const allowed = ALLOWED[cur.status] ?? [];
    if (!allowed.includes(status)) {
      throw new OrderError(400, "bad_request");
    }
    await cl.query("update orders set status = $2, updated_at = now() where id = $1", [
      orderId,
      status,
    ]);
    if (status === "cancelled") {
      await restock(cl, orderId);
    }
  });
  await audit("vendor_order_status", ownerId, ip, { order: orderId, status });
}

export type VendorEarnings = {
  deliveredCount: number;
  goodsTotal: number;
  codTotal: number;
  mpesaTotal: number;
};

export async function vendorEarnings(ownerId: string): Promise<VendorEarnings> {
  const r = await db.q<{
    delivered_count: number;
    goods_total: number;
    cod_total: number;
    mpesa_total: number;
  }>(
    `select count(*)::int as delivered_count,
            coalesce(sum(o.total_kes - o.delivery_fee_kes), 0)::int as goods_total,
            coalesce(sum(case when o.payment = 'cod' then o.total_kes - o.delivery_fee_kes else 0 end), 0)::int as cod_total,
            coalesce(sum(case when o.payment = 'mpesa' then o.total_kes - o.delivery_fee_kes else 0 end), 0)::int as mpesa_total
     from orders o
     join vendors v on v.id = o.vendor_id
     where v.owner_id = $1
       and o.status = 'delivered'`,
    [ownerId],
  );
  const row = r.rows[0];
  return {
    deliveredCount: row?.delivered_count ?? 0,
    goodsTotal: row?.goods_total ?? 0,
    codTotal: row?.cod_total ?? 0,
    mpesaTotal: row?.mpesa_total ?? 0,
  };
}
