import "./load-project-env";
import { generateURI } from "otplib";
import {
  staffDevLoginPrefill,
  STAFF_DEV_EMAIL_DEFAULT,
  STAFF_DEV_PASSWORD_DEFAULT,
} from "../lib/nakuru/staff-dev-defaults";
import { config } from "../lib/server/config";
import { db } from "../lib/server/db";
import { email as emailSchema } from "../lib/server/schemas";
import { upsertStaffUser } from "../lib/server/staff-upsert";

if (config.env === "production") {
  console.error("Refusing to seed dev staff in production.");
  process.exit(1);
}

const fromEnv = process.env.STAFF_DEV_EMAIL?.trim();
const prefill = staffDevLoginPrefill();
const rawEmail = fromEnv || prefill?.email || STAFF_DEV_EMAIL_DEFAULT;
const password =
  process.env.STAFF_DEV_PASSWORD?.trim() ||
  prefill?.password ||
  process.env.STAFF_PASSWORD?.trim() ||
  STAFF_DEV_PASSWORD_DEFAULT;

const parsed = emailSchema.safeParse(rawEmail);
if (!parsed.success || password.length < 12) {
  console.error(
    "Set STAFF_DEV_PASSWORD (12+ chars) or use defaults from lib/nakuru/staff-dev-defaults.ts",
  );
  process.exit(1);
}

const staffEmail = parsed.data;

async function main() {
  const { totpSecret } = await upsertStaffUser(staffEmail, "admin", password);

  console.log(`Dev staff ready: ${staffEmail} (admin). Sign in at /staff`);
  if (config.staffTotpRequired && totpSecret) {
    console.log("Add to your authenticator app:");
    console.log(
      generateURI({ issuer: "NakuruHub", label: staffEmail, secret: totpSecret }),
    );
  } else {
    console.log(
      "Use the same password as NEXT_PUBLIC_STAFF_DEV_PASSWORD / STAFF_DEV_PASSWORD in .env.local",
    );
  }
  await db.pool.end();
}

main().catch((e: Error) => {
  console.error(e.message);
  process.exit(1);
});