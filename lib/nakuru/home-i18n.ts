import type { LandingLang } from "@/lib/nakuru/i18n";
import type { CategoryId } from "@/lib/nakuru/types";

export type HomeCopyKey =
  | "deliverTo"
  | "zoneSheetTitle"
  | "zoneWaitlistHint"
  | "searchPlaceholder"
  | "searchSubmit"
  | "searchPhoto"
  | "trustVerifiedTitle"
  | "trustVerifiedSub"
  | "trustPayTitle"
  | "trustPaySub"
  | "qaCategories"
  | "qaQuote"
  | "qaSell"
  | "qaGuide"
  | "slide0Title"
  | "slide0Sub"
  | "slide1Title"
  | "slide1Sub"
  | "slide2Title"
  | "slide2Sub"
  | "soon"
  | "topRankings"
  | "topRankingsSub"
  | "topCategories"
  | "pickedForYou"
  | "seeAll"
  | "verifiedPill"
  | "payOnDelivery"
  | "addedToCart"
  | "addToCart"
  | "navHome"
  | "navCategory"
  | "navMessage"
  | "navCart"
  | "navAccount"
  | "vendorCardTitle"
  | "vendorCardSub"
  | "vendorCardCta"
  | "vendorCardDismissAria"
  | "popularRightNow"
  | "browseByType"
  | "moreComingSoon"
  | "categoryRailAria"
  | "catGroupShopDesc"
  | "catGroupPropertyDesc"
  | "catGroupCarsDesc"
  | "catGroupServicesDesc"
  | "allShop"
  | "allProperty"
  | "allCars"
  | "allServices"
  | "listings"
  | "sideFeatured";

export type TopCategorySlug =
  | "phone"
  | "tv"
  | "kitchen"
  | "dress"
  | "sneaker"
  | "veg"
  | "watch"
  | "rent"
  | "sale"
  | "plot"
  | "toyota"
  | "subaru"
  | "electric"
  | "clean";

const COPY: Record<HomeCopyKey, Record<LandingLang, string>> = {
  deliverTo: { en: "Deliver to", sw: "Tuma kwa" },
  zoneSheetTitle: { en: "Delivery area", sw: "Eneo la usafirishaji" },
  zoneWaitlistHint: {
    en: "Outside Nakuru — join the waitlist",
    sw: "Nje ya Nakuru — jiunge na orodha ya kusubiri",
  },
  searchPlaceholder: {
    en: "Search shops, homes, cars, services",
    sw: "Tafuta maduka, nyumba, magari, huduma",
  },
  searchSubmit: { en: "Search", sw: "Tafuta" },
  searchPhoto: { en: "Search by photo", sw: "Tafuta kwa picha" },
  trustVerifiedTitle: { en: "Verified vendors", sw: "Wauzaji waliothibitishwa" },
  trustVerifiedSub: { en: "ID and shop checked", sw: "Kitambulisho na duka vimekaguliwa" },
  trustPayTitle: { en: "Pay on delivery", sw: "Lipa ukifika" },
  trustPaySub: { en: "Pay when it arrives", sw: "Lipa bidhaa itakapofika" },
  qaCategories: { en: "Categories", sw: "Kategoria" },
  qaQuote: { en: "Request a quote", sw: "Omba bei" },
  qaSell: { en: "Sell with us", sw: "Uza nasi" },
  qaGuide: { en: "New user guide", sw: "Mwongozo wa mtumiaji mpya" },
  slide0Title: {
    en: "Free delivery on your first order",
    sw: "Usafirishaji bure kwa agizo lako la kwanza",
  },
  slide0Sub: {
    en: "Pay on delivery · Nakuru only",
    sw: "Lipa ukifika · Nakuru pekee",
  },
  slide1Title: {
    en: "List your home or car free",
    sw: "Orodhesha nyumba au gari lako bure",
  },
  slide1Sub: {
    en: "Free to join and list",
    sw: "Bure kujiunga na kuorodhesha",
  },
  slide2Title: {
    en: "Get Verified, get paid upfront",
    sw: "Thibitishwa, lipwa mapema",
  },
  slide2Sub: {
    en: "M-Pesa for trusted vendors",
    sw: "M-Pesa kwa wauzaji wanaoaminika",
  },
  soon: { en: "Soon", sw: "Inakuja" },
  topRankings: { en: "Top rankings", sw: "Orodha bora" },
  topRankingsSub: {
    en: "Make shopping efficient",
    sw: "Fanya ununuzi uwe rahisi",
  },
  topCategories: { en: "Top categories", sw: "Kategoria kuu" },
  pickedForYou: { en: "Picked for you", sw: "Imechaguliwa kwako" },
  seeAll: { en: "See all", sw: "Angalia zote" },
  verifiedPill: { en: "Verified", sw: "Thibitishwa" },
  payOnDelivery: { en: "Pay on delivery", sw: "Lipa ukifika" },
  addedToCart: { en: "Added", sw: "Imeongezwa" },
  addToCart: { en: "Add to cart", sw: "Ongeza kwenye kikapu" },
  navHome: { en: "Home", sw: "Nyumbani" },
  navCategory: { en: "Category", sw: "Kategoria" },
  navMessage: { en: "Message", sw: "Ujumbe" },
  navCart: { en: "Cart", sw: "Kikapu" },
  navAccount: { en: "Account", sw: "Akaunti" },
  vendorCardTitle: { en: "Sell on NakuruHub", sw: "Uza kwenye NakuruHub" },
  vendorCardSub: { en: "Free to join and list.", sw: "Bure kujiunga na kuorodhesha." },
  vendorCardCta: { en: "Start selling", sw: "Anza kuuza" },
  vendorCardDismissAria: {
    en: "Dismiss seller invite",
    sw: "Funga mwaliko wa kuuza",
  },
  popularRightNow: { en: "Popular right now", sw: "Maarufu sasa hivi" },
  browseByType: { en: "Browse by type", sw: "Vinjari kwa aina" },
  moreComingSoon: { en: "More coming soon", sw: "Zaidi inakuja" },
  categoryRailAria: { en: "Category groups", sw: "Makundi ya kategoria" },
  catGroupShopDesc: {
    en: "Phones, fashion, groceries and more",
    sw: "Simu, mitindo, vyakula na zaidi",
  },
  catGroupPropertyDesc: {
    en: "Rentals, sales and land in Nakuru",
    sw: "Kukodisha, kuuza na ardhi Nakuru",
  },
  catGroupCarsDesc: {
    en: "Browse verified car listings",
    sw: "Vinjari magari yaliyothibitishwa",
  },
  catGroupServicesDesc: {
    en: "Electricians, cleaners, plumbers and more",
    sw: "Mafundi umeme, usafi, mabomba na zaidi",
  },
  allShop: { en: "All shop", sw: "Duka zote" },
  allProperty: { en: "All property", sw: "Mali zote" },
  allCars: { en: "All cars", sw: "Magari yote" },
  allServices: { en: "All services", sw: "Huduma zote" },
  listings: { en: "Listings", sw: "Orodha" },
  sideFeatured: { en: "Featured", sw: "Maalum" },
};

const TOP_CATEGORY_LABELS: Record<
  TopCategorySlug,
  Record<LandingLang, string>
> = {
  phone: { en: "Smart phones", sw: "Simu mahiri" },
  tv: { en: "Televisions", sw: "Televisheni" },
  kitchen: { en: "Kitchen supplies", sw: "Vifaa vya jikoni" },
  dress: { en: "Fashion", sw: "Mitindo" },
  sneaker: { en: "Shoes", sw: "Viatu" },
  veg: { en: "Groceries", sw: "Vyakula" },
  watch: { en: "Watches", sw: "Saa" },
  rent: { en: "Homes to rent", sw: "Nyumba za kukodisha" },
  sale: { en: "Homes for sale", sw: "Nyumba za kuuza" },
  plot: { en: "Land", sw: "Ardhi" },
  toyota: { en: "Toyota", sw: "Toyota" },
  subaru: { en: "Subaru", sw: "Subaru" },
  electric: { en: "Electricians", sw: "Mafundi umeme" },
  clean: { en: "Cleaning", sw: "Usafishaji" },
};

const CAT_LABELS: Record<CategoryId, Record<LandingLang, string>> = {
  all: { en: "All", sw: "Yote" },
  shop: { en: "Shop", sw: "Duka" },
  property: { en: "Property", sw: "Mali isimu" },
  cars: { en: "Cars", sw: "Magari" },
  services: { en: "Services", sw: "Huduma" },
  stays: { en: "Stays", sw: "Malazi" },
  taxi: { en: "Taxi", sw: "Teksi" },
};

export function homeCopy(key: HomeCopyKey, lang: LandingLang): string {
  return COPY[key][lang];
}

export function homeCategoryLabel(id: CategoryId, lang: LandingLang): string {
  return CAT_LABELS[id]?.[lang] ?? id;
}

export function homeTopCategoryLabel(
  slug: string,
  lang: LandingLang,
): string {
  const row = TOP_CATEGORY_LABELS[slug as TopCategorySlug];
  return row?.[lang] ?? slug;
}

export const SLIDE_COPY_KEYS: [HomeCopyKey, HomeCopyKey][] = [
  ["slide0Title", "slide0Sub"],
  ["slide1Title", "slide1Sub"],
  ["slide2Title", "slide2Sub"],
];

const GROUP_DESC: Partial<Record<CategoryId, HomeCopyKey>> = {
  shop: "catGroupShopDesc",
  property: "catGroupPropertyDesc",
  cars: "catGroupCarsDesc",
  services: "catGroupServicesDesc",
};

const GROUP_ALL: Partial<Record<CategoryId, HomeCopyKey>> = {
  shop: "allShop",
  property: "allProperty",
  cars: "allCars",
  services: "allServices",
};

export function homeCategoryGroupDesc(
  id: CategoryId,
  lang: LandingLang,
): string {
  const key = GROUP_DESC[id];
  return key ? homeCopy(key, lang) : "";
}

export function homeCategoryAllLabel(
  id: CategoryId,
  lang: LandingLang,
): string {
  const key = GROUP_ALL[id];
  return key ? homeCopy(key, lang) : homeCategoryLabel(id, lang);
}