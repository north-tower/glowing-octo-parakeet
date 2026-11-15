import { z } from "zod";
import { ZONES } from "@/lib/nakuru/data/zones";
import { config } from "@/lib/server/config";

const zoneKeys = Object.keys(ZONES) as [string, ...string[]];

export const phone = z
  .string()
  .trim()
  .max(16)
  .transform((s) => s.replace(/[\s-]/g, ""))
  .refine((s) => /^(?:\+?254|0)[17]\d{8}$/.test(s))
  .transform((s) => "+254" + s.replace(/^(?:\+?254|0)/, ""));

export const email = z
  .string()
  .trim()
  .toLowerCase()
  .max(254)
  .email();

export const uuid = z
  .string()
  .regex(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  );

const cat = z.enum(["shop", "property", "cars", "services"]);
const money = z.number().int().min(0).max(100_000_000);

export const productNew = z
  .object({
    vendorId: uuid.optional(),
    category: cat,
    title: z.string().trim().min(2).max(80),
    description: z.string().trim().max(500).default(""),
    emoji: z.string().trim().min(1).max(8).default("🛍️"),
    price: money,
    stock: z.number().int().min(0).max(100_000).nullable().optional(),
  })
  .strict();

export const productUpd = z
  .object({
    title: z.string().trim().min(2).max(80).optional(),
    price: money.optional(),
    stock: z.number().int().min(0).max(100_000).nullable().optional(),
    active: z.boolean().optional(),
  })
  .strict();

export const orderNew = z
  .object({
    items: z
      .array(
        z
          .object({
            productId: uuid,
            qty: z.number().int().min(1).max(99),
          })
          .strict(),
      )
      .min(1)
      .max(20),
    zone: z.enum(zoneKeys),
    payment: z.enum(["cod", "mpesa"]),
    address: z.string().trim().min(3).max(200),
    phone: phone.optional(),
    lat: z.number().min(-90).max(90).optional(),
    lng: z.number().min(-180).max(180).optional(),
  })
  .strict();

export const deliver = z
  .object({
    code: z.string().regex(/^\d{4}$/),
  })
  .strict();

export const vendorStatus = z
  .object({
    status: z.enum(["accepted", "ready", "cancelled"]),
  })
  .strict();

export const riderNew = z.object({ phone }).strict();

export const assign = z.object({ riderId: uuid }).strict();

export const otpReq = z.object({ email }).strict();

export const otpVerify = z
  .object({
    email,
    code: z.string().regex(/^\d{6}$/),
  })
  .strict();

export const staff = z
  .object({
    email,
    password: z.string().min(12).max(128),
    totp: z.string().regex(/^\d{6}$/).optional(),
  })
  .strict();

const vendorApplyCategory = z.enum([
  "shop",
  "property",
  "cars",
  "services",
  "stays",
  "taxi",
]);

const launchCategorySet = new Set<string>(config.launchCategories);

export const vendorNew = z
  .object({
    name: z.string().trim().min(2).max(60),
    categories: z.array(vendorApplyCategory).min(1).max(4),
  })
  .strict()
  .refine(
    (data) => data.categories.every((c) => launchCategorySet.has(c)),
    { path: ["categories"] },
  );

export const inquiryNew = z
  .object({
    productId: uuid,
    message: z.string().trim().max(500).default(""),
  })
  .strict();