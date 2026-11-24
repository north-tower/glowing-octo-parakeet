import { db } from "./db";

export type AdminInquiryRow = {
  id: string;
  status: string;
  message: string;
  createdAt: Date;
  customerId: string;
  customerEmail: string | null;
  productId: string;
  productTitle: string;
  vendorId: string;
  vendorName: string;
};

export type ListAdminInquiriesInput = {
  limit: number;
  cursorAt?: Date;
  cursorId?: string;
  status?: "open" | "closed";
};

export function adminInquiryToJson(row: AdminInquiryRow) {
  return {
    id: row.id,
    status: row.status,
    message: row.message,
    createdAt: row.createdAt.toISOString(),
    customerId: row.customerId,
    customerEmail: row.customerEmail,
    productId: row.productId,
    productTitle: row.productTitle,
    vendorId: row.vendorId,
    vendorName: row.vendorName,
  };
}

export async function listAdminInquiries(
  input: ListAdminInquiriesInput,
): Promise<AdminInquiryRow[]> {
  const clauses = ["1=1"];
  const params: unknown[] = [];
  let n = 1;

  if (input.status) {
    clauses.push(`i.status = $${n++}`);
    params.push(input.status);
  }

  if (input.cursorAt && input.cursorId) {
    clauses.push(
      `(i.created_at, i.id) < ($${n++}::timestamptz, $${n++}::uuid)`,
    );
    params.push(input.cursorAt, input.cursorId);
  }

  params.push(input.limit);

  const r = await db.q<{
    id: string;
    status: string;
    message: string;
    created_at: Date;
    customer_id: string;
    customer_email: string | null;
    product_id: string;
    product_title: string;
    vendor_id: string;
    vendor_name: string;
  }>(
    `select i.id, i.status, i.message, i.created_at,
            i.customer_id, u.email as customer_email,
            i.product_id, p.title as product_title,
            v.id as vendor_id, v.name as vendor_name
     from service_inquiries i
     join users u on u.id = i.customer_id
     join products p on p.id = i.product_id
     join vendors v on v.id = p.vendor_id
     where ${clauses.join(" and ")}
     order by i.created_at desc, i.id desc
     limit $${n}`,
    params,
  );

  return r.rows.map((row) => ({
    id: row.id,
    status: row.status,
    message: row.message,
    createdAt: row.created_at,
    customerId: row.customer_id,
    customerEmail: row.customer_email,
    productId: row.product_id,
    productTitle: row.product_title,
    vendorId: row.vendor_id,
    vendorName: row.vendor_name,
  }));
}