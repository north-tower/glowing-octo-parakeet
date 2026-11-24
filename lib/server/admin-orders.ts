import { db } from "./db";

export type AdminOrderRow = {
  id: string;
  status: string;
  totalKes: number;
  deliveryFeeKes: number;
  payment: string;
  paymentStatus: string;
  zone: string | null;
  address: string | null;
  createdAt: Date;
  customerId: string;
  customerEmail: string | null;
  vendorId: string | null;
  vendorName: string | null;
  itemCount: number;
};

export type ListAdminOrdersInput = {
  limit: number;
  cursorAt?: Date;
  cursorId?: string;
  status?: string;
  openOnly?: boolean;
};

const TERMINAL_SQL = "'delivered', 'cancelled', 'refused'";

export function adminOrderToJson(row: AdminOrderRow) {
  return {
    id: row.id,
    status: row.status,
    totalKes: row.totalKes,
    deliveryFeeKes: row.deliveryFeeKes,
    payment: row.payment,
    paymentStatus: row.paymentStatus,
    zone: row.zone,
    address: row.address,
    createdAt: row.createdAt.toISOString(),
    customerId: row.customerId,
    customerEmail: row.customerEmail,
    vendorId: row.vendorId,
    vendorName: row.vendorName,
    itemCount: row.itemCount,
  };
}

export async function listAdminOrders(
  input: ListAdminOrdersInput,
): Promise<AdminOrderRow[]> {
  const clauses = ["1=1"];
  const params: unknown[] = [];
  let n = 1;

  if (input.openOnly) {
    clauses.push(`o.status not in (${TERMINAL_SQL})`);
  } else if (input.status) {
    clauses.push(`o.status = $${n++}`);
    params.push(input.status);
  }

  if (input.cursorAt && input.cursorId) {
    clauses.push(
      `(o.created_at, o.id) < ($${n++}::timestamptz, $${n++}::uuid)`,
    );
    params.push(input.cursorAt, input.cursorId);
  }

  params.push(input.limit);

  const r = await db.q<{
    id: string;
    status: string;
    total_kes: number;
    delivery_fee_kes: number;
    payment: string;
    payment_status: string;
    zone: string | null;
    address: string | null;
    created_at: Date;
    customer_id: string;
    customer_email: string | null;
    vendor_id: string | null;
    vendor_name: string | null;
    item_count: number;
  }>(
    `select o.id, o.status, o.total_kes, o.delivery_fee_kes, o.payment,
            o.payment_status, o.zone, o.address, o.created_at,
            o.customer_id, u.email as customer_email,
            o.vendor_id, v.name as vendor_name,
            (select count(*)::int from order_items i where i.order_id = o.id) as item_count
     from orders o
     join users u on u.id = o.customer_id
     left join vendors v on v.id = o.vendor_id
     where ${clauses.join(" and ")}
     order by o.created_at desc, o.id desc
     limit $${n}`,
    params,
  );

  return r.rows.map((row) => ({
    id: row.id,
    status: row.status,
    totalKes: row.total_kes,
    deliveryFeeKes: row.delivery_fee_kes,
    payment: row.payment,
    paymentStatus: row.payment_status,
    zone: row.zone,
    address: row.address,
    createdAt: row.created_at,
    customerId: row.customer_id,
    customerEmail: row.customer_email,
    vendorId: row.vendor_id,
    vendorName: row.vendor_name,
    itemCount: row.item_count,
  }));
}

export async function getAdminOrderItems(orderId: string): Promise<
  { productId: string; title: string; unitKes: number; qty: number }[]
> {
  const r = await db.q<{
    product_id: string;
    title: string;
    unit_kes: number;
    qty: number;
  }>(
    `select product_id, title, unit_kes, qty
     from order_items
     where order_id = $1
     order by title asc`,
    [orderId],
  );
  return r.rows.map((row) => ({
    productId: row.product_id,
    title: row.title,
    unitKes: row.unit_kes,
    qty: row.qty,
  }));
}