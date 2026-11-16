import { generateURI } from "otplib";
import { config } from "../lib/server/config";
import { db } from "../lib/server/db";
import { email as emailSchema } from "../lib/server/schemas";
import { upsertStaffUser, type StaffRole } from "../lib/server/staff-upsert";

const [, , rawEmail, role] = process.argv;
const pw = process.env.STAFF_PASSWORD || "";

const parsed = emailSchema.safeParse(rawEmail);
if (
  !parsed.success ||
  !role ||
  !["admin", "support"].includes(role) ||
  pw.length < 12
) {
  console.error(
    "Usage: STAFF_PASSWORD=<12+ chars> pnpm exec tsx scripts/create-staff.ts <email> <admin|support>",
  );
  process.exit(1);
}

const staffEmail = parsed.data;
const staffRole = role as StaffRole;

async function main() {
  const { totpSecret } = await upsertStaffUser(staffEmail, staffRole, pw);

  console.log(`Staff account ready for ${staffEmail} (${staffRole}).`);
  if (config.staffTotpRequired && totpSecret) {
    console.log("Add to your authenticator app:");
    console.log(
      generateURI({ issuer: "NakuruHub", label: staffEmail, secret: totpSecret }),
    );
  } else {
    console.log("Sign in at /staff with email and password (TOTP is off).");
  }
  await db.pool.end();
}

main().catch((e: Error) => {
  console.error(e.message);
  process.exit(1);
});