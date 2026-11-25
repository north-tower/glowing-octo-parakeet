import type { LucideIcon } from "lucide-react";
import type { CategoryTint } from "@/components/app/category/browse/categories";

export type ListingCardBadge = "verified" | "featured" | "hot" | "new";

export type ListingCardCategory = {
  tint: CategoryTint;
  icon: LucideIcon;
};

export type ListingCardAction = "viewing" | "quote";

export type ListingCardChip =
  | "quote"
  | "viewing"
  | "cod"
  | "free-delivery";

export type ListingCardProps = {
  id: number | string;
  href: string;
  title: string;
  price: number;
  currency: string;
  /** e.g. "From" for services */
  pricePrefix?: string | null;
  priceSuffix?: string | null;
  /** Spoken price for the card link label */
  priceLabel?: string;
  imageUrl?: string;
  imageCount?: number;
  imageWidth?: number;
  imageHeight?: number;
  category: ListingCardCategory;
  seller: string;
  sellerVerified: boolean;
  location: string;
  badges: ListingCardBadge[];
  /** Single non-interactive benefit/type tag */
  chip?: ListingCardChip;
  payOnDelivery?: boolean;
  action?: ListingCardAction;
  saved?: boolean;
  priorityImage?: boolean;
};