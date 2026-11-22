import crypto from "node:crypto";
import { ZONES } from "@/lib/nakuru/data/zones";
import { audit } from "./audit";
import type { PoolClient } from "pg";
import { db } from "./db";
import { dec, enc } from "./secrets";

export class OrderError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string) {
    super(code);
    this.status = status;
    this.code = code;
  }
}

export type OrderCreateInput = {
  items: { productId: string; qty: number }[];
  zone: string;
  payment: "cod" | "mpesa";
  address: string;
  phone?: string;
  lat?: number;
  lng?: number;
};

export type OrderItemRow = {
  productId: string;
  title: string;
  unit: number;
  qty: number;
};

export type CustomerOrderRow = {
  id: string;
  status: string;
  total: number;
  fee: number;
  payment: string;
  paymentStatus: string;
  zone: string;
  address: string;
  vendor: string | null;
  createdAt: string;
  items: OrderItemRow[];
  code?: string;
};

const BOX = { s: -0.37, n: -0.24, w: 36.0, e: 36.16 };

const OPEN = ["placed", "accepted", "ready", "out_for_delivery"];

/** Delivery / M-Pesa contact: body phone, else saved user phone; email-only users must send phone at checkout. */
export async function resolveCheckoutPhone(
  customerId: string,
  orderPhone?: string,
): Promise<string> {
  if (orderPhone) return orderPhone;
  const row = (
    await db.q<{ phone: string | null }>(
      "select phone from users where id = $1",
      [customerId],
    )
  ).rows[0];
  const phone = row?.phone;
  if (!phone) {
    throw new OrderError(400, "phone_required");
  }
  return phone;
}

async function restock(cl: PoolClient, orderId: string): Promise<void> {
  await cl.query(
    `update products p set stock = p.stock + i.qty
     from order_items i
     where i.order_id = $1 and i.product_id = p.id and p.stock is not null`,
    [orderId],
  );
}

function shapeOrder(
  o: {
    id: string;
    status: string;
    total_kes: number;
    delivery_fee_kes: number;
    payment: string;
    payment_status: string;
    zone: string;
    address: string;
    created_at: Date;
    vendor?: string | null;
    delivery_code_enc?: string | null;
  },
  items: OrderItemRow[],
  code?: string | null,
): CustomerOrderRow {
  let deliveryCode: string | undefined;
  if (code) deliveryCode = code;
  else if (
    OPEN.includes(o.status) &&
    o.delivery_code_enc
  ) {
    try {
      deliveryCode = dec(o.delivery_code_enc);
    } catch {
      deliveryCode = undefined;
    }
  }
  return {
    id: o.id,
    status: o.status,
    total: o.total_kes,
    fee: o.delivery_fee_kes,
    payment: o.payment,
    paymentStatus: o.payment_status,
    zone: o.zone,
    address: o.address,
    vendor: o.vendor ?? null,
    createdAt: o.created_at.toISOString(),
    items,
    ...(deliveryCode ? { code: deliveryCode } : {}),
  };
}

export async function createShopOrders(
  customerId: string,
  data: OrderCreateInput,
  ip: string | null,
): Promise<CustomerOrderRow[]> {
  if (data.payment === "mpesa") {
    throw new OrderError(503, "mpesa_unavailable");
  }

  const want = new Map<string, number>();
  for (const i of data.items) {
    want.set(i.productId, (want.get(i.productId) ?? 0) + i.qty);
  }
  if ([...want.values()].some((q) => q > 99)) {
    throw new OrderError(400, "bad_request");
  }

  const fee = ZONES[data.zone];
  if (fee === undefined) {
    throw new OrderError(400, "bad_request");
  }

  const ids = [...want.keys()];
  const inBox =
    data.lat !== undefined &&
    data.lng !== undefined &&
    data.lat >= BOX.s &&
    data.lat <= BOX.n &&
    data.lng >= BOX.w &&
    data.lng <= BOX.e;

  await resolveCheckoutPhone(customerId, data.phone);

  type ProductRow = {
    id: string;
    title: string;
    price_kes: number;
    stock: number | null;
    vendor_id: string;
    verified: boolean;
    owner_id: string;
  };

  const made = await db.tx(async (cl) => {
    const rows = (
      await cl.query<ProductRow>(
        `select p.id, p.title, p.price_kes, p.stock, p.vendor_id, v.verified, v.owner_id
         from products p
         join vendors v on v.id = p.vendor_id
         join categories c on c.slug = p.category
         where p.id = any($1::uuid[])
           and p.active
           and c.listing_mode = 'shop'
           and v.status = 'approved'
         order by p.id
         for update of p`,
        [ids],
      )
    ).rows;

    if (rows.length !== ids.length) {
      throw new OrderError(409, "unavailable");
    }

    const by: Record<
      string,
      { verified: boolean; rows: (ProductRow & { q: number })[] }
    > = {};

    for (const r of rows) {
      const q = want.get(r.id)!;
      if (r.owner_id === customerId) {
        throw new OrderError(400, "own_product");
      }
      if (r.stock !== null) {
        if (r.stock < q) {
          throw new OrderError(409, "out_of_stock");
        }
        await cl.query("update products set stock = stock - $2 where id = $1", [
          r.id,
          q,
        ]);
      }
      const bucket = (by[r.vendor_id] ??= {
        verified: r.verified,
        rows: [],
      });
      bucket.rows.push({ ...r, q });
    }

    if (data.payment === "mpesa") {
      const vendors = Object.keys(by);
      if (vendors.length !== 1) {
        throw new OrderError(400, "mpesa_single_vendor");
      }
      if (!by[vendors[0]!]!.verified) {
        throw new OrderError(400, "mpesa_needs_verified_vendor");
      }
    }

    const out: {
      o: {
        id: string;
        status: string;
        total_kes: number;
        delivery_fee_kes: number;
        payment: string;
        payment_status: string;
        zone: string;
        address: string;
        created_at: Date;
      };
      code: string;
      items: OrderItemRow[];
    }[] = [];

    for (const vendorId of Object.keys(by)) {
      const group = by[vendorId]!;
      const sub = group.rows.reduce((a, r) => a + r.price_kes * r.q, 0);
      const total = sub + fee;
      const code = String(crypto.randomInt(1000, 10000));
      const o = (
        await cl.query<{
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
          `insert into orders(
             customer_id, vendor_id, total_kes, payment, zone,
             delivery_fee_kes, address, delivery_code_enc, delivery_point
           )
           values (
             $1, $2, $3, $4, $5, $6, $7, $8,
             case when $9::boolean
               then ST_SetSRID(ST_MakePoint($11::float8, $10::float8), 4326)::geography
             end
           )
           returning id, status, total_kes, delivery_fee_kes, payment,
                     payment_status, zone, address, created_at`,
          [
            customerId,
            vendorId,
            total,
            data.payment,
            data.zone,
            fee,
            data.address,
            enc(code),
            inBox,
            inBox ? data.lat : 0,
            inBox ? data.lng : 0,
          ],
        )
      ).rows[0]!;

      for (const r of group.rows) {
        await cl.query(
          `insert into order_items(order_id, product_id, title, unit_kes, qty)
           values ($1, $2, $3, $4, $5)`,
          [o.id, r.id, r.title, r.price_kes, r.q],
        );
      }

      out.push({
        o,
        code,
        items: group.rows.map((r) => ({
          productId: r.id,
          title: r.title,
          unit: r.price_kes,
          qty: r.q,
        })),
      });
    }

    return out;
  });

  for (const m of made) {
    audit("order_placed", customerId, ip, {
      order: m.o.id,
      total: m.o.total_kes,
    });
  }

  return made.map((m) => shapeOrder(m.o, m.items, m.code));
}

async function itemsForOrderIds(
  orderIds: string[],
): Promise<Record<string, OrderItemRow[]>> {
  const m: Record<string, OrderItemRow[]> = {};
  if (!orderIds.length) return m;
  const rows = (
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
      [orderIds],
    )
  ).rows;
  for (const r of rows) {
    (m[r.order_id] ??= []).push({
      productId: r.product_id,
      title: r.title,
      unit: r.unit_kes,
      qty: r.qty,
    });
  }
  return m;
}

export async function listCustomerOrders(
  customerId: string,
): Promise<CustomerOrderRow[]> {
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
      delivery_code_enc: string | null;
      vendor: string | null;
    }>(
      `select o.id, o.status, o.total_kes, o.delivery_fee_kes, o.payment,
              o.payment_status, o.zone, o.address, o.created_at,
              o.delivery_code_enc, v.name as vendor
       from orders o
       left join vendors v on v.id = o.vendor_id
       where o.customer_id = $1
       order by o.created_at desc
       limit 30`,
      [customerId],
    )
  ).rows;

  const items = await itemsForOrderIds(rows.map((o) => o.id));
  return rows.map((o) => shapeOrder(o, items[o.id] ?? []));
}

export { restock };