import { db } from "./db";

export class OrderError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string) {
    super(code);
    this.status = status;
    this.code = code;
  }
}

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