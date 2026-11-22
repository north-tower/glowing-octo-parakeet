import type { CategoryIconKey } from "@/lib/nakuru/category-icons";
import type { CategoryId } from "@/lib/nakuru/types";

export const CATS: [CategoryId, string][] = [
  ["all", "All"],
  ["shop", "Shop"],
  ["property", "Property"],
  ["cars", "Cars"],
  ["services", "Services"],
  ["stays", "Stays"],
  ["taxi", "Taxi"],
  ["rider", "Rider"],
];

export const BROWSE_SIDES = [
  "shop",
  "property",
  "cars",
  "services",
  "stays",
  "taxi",
  "rider",
] as const;

export const ACT: Record<string, string> = {
  shop: "Add to cart",
  property: "Request viewing",
  cars: "Request viewing",
  services: "Request quote",
  rider: "Request quote",
  taxi: "Request quote",
  stays: "Add to cart",
};

export type TopCategoryTint = "teal" | "green" | "sand" | "pink";

/** [icon key, English label, category, search filter slug, tint group] */
export const TOPC: [
  CategoryIconKey,
  string,
  CategoryId,
  string,
  TopCategoryTint,
][] = [
  ["smartphone", "Smart phones", "shop", "phone", "teal"],
  ["tv", "Televisions", "shop", "tv", "teal"],
  ["cooking-pot", "Kitchen supplies", "shop", "kitchen", "teal"],
  ["shirt", "Fashion", "shop", "dress", "teal"],
  ["shoe", "Shoes", "shop", "sneaker", "teal"],
  ["salad", "Groceries", "shop", "veg", "teal"],
  ["watch", "Watches", "shop", "watch", "teal"],
  ["home", "Homes to rent", "property", "rent", "green"],
  ["home-sale", "Homes for sale", "property", "sale", "green"],
  ["land-plot", "Land", "property", "plot", "green"],
  ["car", "Toyota", "cars", "toyota", "sand"],
  ["car", "Subaru", "cars", "subaru", "sand"],
  ["car", "All cars", "cars", "", "sand"],
  ["bolt", "Electricians", "services", "electric", "pink"],
  ["spray-bottle", "Cleaning", "services", "clean", "pink"],
  ["wrench", "Plumbers", "services", "plumb", "pink"],
  ["bed", "BnBs & apartments", "stays", "bnb", "green"],
  ["bed", "Hotels", "stays", "hotel", "green"],
  ["home", "Short stays", "stays", "short", "green"],
  ["grid", "All stays", "stays", "", "green"],
  ["taxi", "Airport rides", "taxi", "airport", "sand"],
  ["taxi", "Town rides", "taxi", "town", "sand"],
  ["car", "Boda", "taxi", "boda", "pink"],
  ["grid", "All taxi", "taxi", "", "sand"],
  ["taxi", "Delivery rider", "rider", "delivery", "sand"],
  ["taxi", "Courier", "rider", "courier", "teal"],
  ["car", "Boda rider", "rider", "boda", "pink"],
  ["grid", "All riders", "rider", "", "sand"],
];

/** Indices into `TOPC` (not `ITEMS`). */
export const FEAT = [0, 1, 2, 7, 10, 13, 3, 9, 14];

/** Six popular picks on Category → Featured (mixed groups). */
export const CAT_POPULAR = [0, 5, 7, 10, 13, 9] as const;

export type SideRailIcon =
  | "sparkle"
  | "shopping-bag"
  | "home"
  | "car"
  | "wrench"
  | "bed"
  | "taxi";

export const SIDE: [string, string, SideRailIcon][] = [
  ["feat", "Featured", "sparkle"],
  ["shop", "Shop", "shopping-bag"],
  ["property", "Property", "home"],
  ["cars", "Cars", "car"],
  ["services", "Services", "wrench"],
  ["stays", "Stays", "bed"],
  ["taxi", "Taxi", "taxi"],
  ["rider", "Rider", "taxi"],
];

/** Browse-by-type tiles on Featured (switch rail via SET_SIDE). */
export const BROWSE_GROUPS: {
  side: string;
  icon: CategoryIconKey;
  tint: TopCategoryTint;
}[] = [
  { side: "shop", icon: "shirt", tint: "teal" },
  { side: "property", icon: "home", tint: "green" },
  { side: "cars", icon: "car", tint: "sand" },
  { side: "services", icon: "wrench", tint: "pink" },
  { side: "stays", icon: "bed", tint: "green" },
  { side: "taxi", icon: "taxi", tint: "sand" },
  { side: "rider", icon: "taxi", tint: "pink" },
];

export const RANK: [number, string, string][] = [
  [3, "Most popular", "14.6k+ heats"],
  [2, "New this week", "280+ views"],
  [8, "Trending", "63% up"],
  [5, "Top rated", "4.8 stars"],
];

export const SLIDES: [string, string, string, string][] = [
  [
    "linear-gradient(135deg,#073b39,#0d6f69)",
    "Free delivery on your first order",
    "Pay on delivery · Nakuru only",
    "delivery",
  ],
  [
    "linear-gradient(135deg,#e8506d,#f59a6b)",
    "List your home or car free",
    "Free to join and list",
    "property",
  ],
  [
    "linear-gradient(135deg,#073b39,#0a4a47)",
    "Get Verified, get paid upfront",
    "M-Pesa for trusted vendors",
    "verified",
  ],
];

export const MSGS: [string, string, string, string][] = [
  ["🛍️", "Mama Fashions", "Your dress is ready for pickup", "2m"],
  ["🏠", "Zawadi Agents", "Viewing confirmed for Saturday 10am", "1h"],
  ["🛵", "Rider James", "I'm at the gate, code please", "Yesterday"],
  ["🦩", "NakuruHub Support", "Welcome! Tap here if you need help", "Mon"],
];

export const STAT = [
  "Placed",
  "Accepted",
  "Ready for pickup",
  "Out for delivery",
  "Delivered (cash collected)",
];

export const TOOLS: Record<string, string[]> = {
  shop: ["Add product", "Stock", "Orders", "Earnings"],
  property: ["Add listing", "Viewing requests", "Mark rented/sold"],
  cars: ["Add vehicle", "Inquiries", "Upload logbook"],
  services: ["Service profile", "Quote requests", "Job history"],
  stays: ["Add stay", "Bookings", "Calendar", "Earnings"],
  taxi: ["Driver profile", "Trip requests", "Earnings", "Safety tools"],
  rider: [
    "Rider profile",
    "Delivery jobs",
    "Trip history",
    "Earnings",
  ],
};

export const PHONE_REGEX = /^(?:\+?254|0)[17]\d{8}$/;
export const MAX_CART_QTY = 99;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export function categoryName(c: string): string {
  const row = CATS.find((x) => x[0] === c);
  return row ? row[1] : c;
}