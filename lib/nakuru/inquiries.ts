import { ApiError } from "@/lib/nakuru/api";

export type VendorInquiryRow = {
  id: string;
  productId: string;
  productTitle: string;
  customerEmail: string | null;
  message: string;
  status: string;
  createdAt: string;
};

export function inquiryErrorMessage(err: unknown): string {
  if (!(err instanceof ApiError)) {
    return err instanceof Error ? err.message : "Could not send quote request";
  }
  switch (err.body.error) {
    case "not_found":
      return "This service is no longer available.";
    case "not_a_service":
      return "Quote requests apply to services only.";
    case "vendor_not_approved":
      return "This vendor is not accepting requests yet.";
    case "own_product":
      return "You cannot request a quote on your own listing.";
    case "too_many_requests":
      return "Too many requests. Wait a while and try again.";
    case "unauthorized":
      return "Sign in with your email code to request a quote.";
    case "bad_request":
      return "Check your message and try again.";
    default:
      return "Could not send quote request. Try again in a moment.";
  }
}