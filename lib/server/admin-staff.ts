import { db } from "./db";

export type StaffMe = {
  id: string;
  email: string;
  role: "admin" | "support";
};

export async function getStaffMe(userId: string): Promise<StaffMe | null> {
  const r = await db.q<{ id: string; email: string | null; role: string }>(
    `select id, email, role
     from users
     where id = $1
       and role in ('admin', 'support')
       and disabled = false`,
    [userId],
  );
  const row = r.rows[0];
  if (!row || !row.email) return null;
  if (row.role !== "admin" && row.role !== "support") return null;
  return { id: row.id, email: row.email, role: row.role };
}