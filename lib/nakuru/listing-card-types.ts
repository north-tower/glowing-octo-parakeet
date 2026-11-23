import type { LucideIcon } from "lucide-react";
import type { CategoryTint } from "@/components/app/category/browse/categories";

export type ListingCardBadge = "verified" | "featured" | "hot" | "new";

export type ListingCardCategory = {
  tint: CategoryTint;
  icon: LucideIcon;
};

export type ListingCardAction = "viewing" | "quote";

export type ListingCardProps = {
  id: number | string;
  href: string;
  title: string;
  price: number;
  currency: string;
  priceSuffix?: string | null;
  imageUrl?: string;
  imageCount?: number;
  category: ListingCardCategory;
  seller: string;
  sellerVerified: boolean;
  location: string;
  badges: ListingCardBadge[];
  payOnDelivery?: boolean;
  action?: ListingCardAction;
  saved?: boolean;
  priorityImage?: boolean;
};