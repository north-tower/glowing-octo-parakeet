/** Local dev only — prefill /staff sign-in; pair with `pnpm staff:seed-dev`. */
export const STAFF_DEV_EMAIL_DEFAULT = "staff@nakuruhub.local";
export const STAFF_DEV_PASSWORD_DEFAULT = "nakuruhub-staff-dev";

export type StaffDevPrefill = { email: string; password: string };

export function staffDevLoginPrefill(): StaffDevPrefill | null {
  if (process.env.NODE_ENV !== "development") return null;
  const email = (
    process.env.NEXT_PUBLIC_STAFF_DEV_EMAIL ?? STAFF_DEV_EMAIL_DEFAULT
  ).trim();
  const password = (
    process.env.NEXT_PUBLIC_STAFF_DEV_PASSWORD ?? STAFF_DEV_PASSWORD_DEFAULT
  ).trim();
  if (!email || password.length < 12) return null;
  return { email, password };
}