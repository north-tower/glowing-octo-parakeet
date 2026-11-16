export type CategoryId =
  | "all"
  | "shop"
  | "property"
  | "cars"
  | "services"
  | "stays"
  | "taxi";

export type TabId = "home" | "cat" | "msg" | "cart" | "acc";

export type AccView = "vendor" | "admin";

export type PayMethod = "cod" | "mpesa";

export type Listing = {
  /** Demo ids are numbers; live catalog uses product UUIDs. */
  id: number | string;
  c: CategoryId;
  e: string;
  /** Public URL when the vendor uploaded a photo. */
  img?: string;
  t: string;
  s: string;
  /** Full listing copy for detail view (API description). */
  desc?: string;
  p: number;
  v: number;
  /** Vendor display name when known (detail / live catalog). */
  vn?: string;
  /** Extra gallery URLs (demo or API). */
  imgs?: string[];
  /** Structured listing fields, e.g. bedrooms, mileage. */
  attrs?: Record<string, string>;
};

export type OrderItemSnap = {
  productId?: string | number;
  title: string;
  unit: number;
  qty: number;
};

export type Order = {
  /** Demo ids are numbers; live orders use server UUIDs. */
  id: number | string;
  total: number;
  pay: string;
  s: number;
  code: string;
  /** True when synced from `POST /orders` or `GET /orders/mine`. */
  live?: boolean;
  status?: string;
  items?: OrderItemSnap[];
  vendor?: string;
  vendorVerified?: boolean;
  zone?: string;
  address?: string;
  fee?: number;
  createdAt?: string;
  /** Checkout-time UI flag: first-order delivery promo was shown as applied. */
  promoFreeDelivery?: boolean;
};

export type VendorApplication = {
  n: string;
  cats: CategoryId[];
  st: string;
  ver: number;
};

export type VendorMe = {
  n: string;
  cats: CategoryId[];
  st: string;
  ver: number;
};

export type NakuruState = {
  tab: TabId;
  cat: CategoryId;
  q: string;
  side: string;
  acc: AccView | null;
  cart: Record<string, number>;
  pay: PayMethod;
  orders: Order[];
  area: string;
  apps: VendorApplication[];
  me: VendorMe | null;
  vc: CategoryId[];
  vn: string;
  vp: string;
  photo: string;
};