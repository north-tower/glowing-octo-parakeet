export type HomeHeroPromotion = {
  id: string;
  productId: string;
  vendorId: string;
  title: string;
  subtitle: string;
  imageUrl: string | null;
  priceKes: number;
  vendorName: string;
  verified: boolean;
};

export type StaffHomePlacement = {
  id: string;
  productId: string;
  productTitle: string;
  vendorName: string;
  onPublicCatalog: boolean;
  placement: string;
  sortOrder: number;
  headline: string | null;
  subtitle: string | null;
  imageUrl: string | null;
  active: boolean;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
};