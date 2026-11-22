import { audit } from "./audit";
import { db } from "./db";
import { sendMail } from "./mailgun";

export class InquiryError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string) {
    super(code);
    this.status = status;
    this.code = code;
  }
}

const INQUIRIES_PER_HOUR = 20;

type ProductForInquiry = {
  id: string;
  category: string;
  listing_mode: string;
  title: string;
  active: boolean;
  vendor_status: string;
  owner_id: string;
  vendor_name: string;
};

export type CustomerInquiryRow = {
  id: string;
  productId: string;
  productTitle: string;
  vendorName: string;
  message: string;
  status: string;
  createdAt: string;
};

export type VendorInquiryRow = {
  id: string;
  productId: string;
  productTitle: string;
  customerEmail: string | null;
  message: string;
  status: string;
  createdAt: string;
};

function shapeCustomerRow(r: {
  id: string;
  product_id: string;
  product_title: string;
  vendor_name: string;
  message: string;
  status: string;
  created_at: Date;
}): CustomerInquiryRow {
  return {
    id: r.id,
    productId: r.product_id,
    productTitle: r.product_title,
    vendorName: r.vendor_name,
    message: r.message,
    status: r.status,
    createdAt: r.created_at.toISOString(),
  };
}

function shapeVendorRow(r: {
  id: string;
  product_id: string;
  product_title: string;
  customer_email: string | null;
  message: string;
  status: string;
  created_at: Date;
}): VendorInquiryRow {
  return {
    id: r.id,
    productId: r.product_id,
    productTitle: r.product_title,
    customerEmail: r.customer_email,
    message: r.message,
    status: r.status,
    createdAt: r.created_at.toISOString(),
  };
}

async function recentInquiryCount(customerId: string): Promise<number> {
  const row = (
    await db.q<{ n: string }>(
      `select count(*)::text as n from service_inquiries
       where customer_id = $1 and created_at > now() - interval '1 hour'`,
      [customerId],
    )
  ).rows[0];
  return Number(row?.n ?? 0);
}

export async function createServiceInquiry(
  customerId: string,
  productId: string,
  message: string,
  ip: string | null,
): Promise<{ id: string }> {
  if ((await recentInquiryCount(customerId)) >= INQUIRIES_PER_HOUR) {
    throw new InquiryError(429, "too_many_requests");
  }

  const product = (
    await db.q<ProductForInquiry>(
      `select p.id, p.category, c.listing_mode, p.title, p.active, v.status as vendor_status,
              v.owner_id, v.name as vendor_name
       from products p
       join vendors v on v.id = p.vendor_id
       join categories c on c.slug = p.category
       where p.id = $1`,
      [productId],
    )
  ).rows[0];

  if (!product || !product.active) {
    throw new InquiryError(404, "not_found");
  }
  if (product.listing_mode !== "services") {
    throw new InquiryError(400, "not_a_service");
  }
  if (product.vendor_status !== "approved") {
    throw new InquiryError(400, "vendor_not_approved");
  }
  if (product.owner_id === customerId) {
    throw new InquiryError(400, "own_product");
  }

  const inserted = (
    await db.q<{ id: string }>(
      `insert into service_inquiries (product_id, customer_id, message)
       values ($1, $2, $3)
       returning id`,
      [productId, customerId, message],
    )
  ).rows[0];

  const owner = (
    await db.q<{ email: string | null }>(
      "select email from users where id = $1",
      [product.owner_id],
    )
  ).rows[0];

  if (owner?.email) {
    try {
      await sendMail({
        to: owner.email,
        subject: "New quote request on NakuruHub",
        text: `You have a new inquiry for "${product.title}" (${product.vendor_name}).\n\nMessage:\n${message || "(no message)"}\n\nSign in to your vendor dashboard to follow up.`,
      });
    } catch (err) {
      console.error(
        "inquiry notify failed:",
        err instanceof Error ? err.message : err,
      );
    }
  }

  audit("inquiry_create", customerId, ip, {
    inquiry: inserted.id,
    product: productId,
  });

  return { id: inserted.id };
}

export async function listCustomerInquiries(
  customerId: string,
): Promise<CustomerInquiryRow[]> {
  const rows = (
    await db.q<{
      id: string;
      product_id: string;
      product_title: string;
      vendor_name: string;
      message: string;
      status: string;
      created_at: Date;
    }>(
      `select i.id, i.product_id, p.title as product_title, v.name as vendor_name,
              i.message, i.status, i.created_at
       from service_inquiries i
       join products p on p.id = i.product_id
       join vendors v on v.id = p.vendor_id
       where i.customer_id = $1
       order by i.created_at desc
       limit 100`,
      [customerId],
    )
  ).rows;
  return rows.map(shapeCustomerRow);
}

export async function listVendorInquiries(
  ownerId: string,
): Promise<VendorInquiryRow[]> {
  const rows = (
    await db.q<{
      id: string;
      product_id: string;
      product_title: string;
      customer_email: string | null;
      message: string;
      status: string;
      created_at: Date;
    }>(
      `select i.id, i.product_id, p.title as product_title, u.email as customer_email,
              i.message, i.status, i.created_at
       from service_inquiries i
       join products p on p.id = i.product_id
       join vendors v on v.id = p.vendor_id
       join users u on u.id = i.customer_id
       where v.owner_id = $1
       order by i.created_at desc
       limit 100`,
      [ownerId],
    )
  ).rows;
  return rows.map(shapeVendorRow);
}