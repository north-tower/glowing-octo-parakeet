import type { LandingLang } from "@/lib/nakuru/i18n";
import { formatCommentTime } from "@/lib/nakuru/comment-display";

export type MessageThreadSummary = {
  id: string;
  productId: string;
  productTitle: string;
  vendorName: string;
  peerLabel: string;
  lastMessage: string;
  lastMessageAt: string;
  asCustomer: boolean;
};

export type ListingMessageRow = {
  id: string;
  body: string;
  senderId: string;
  senderHandle: string;
  mine: boolean;
  createdAt: string;
};

export type MessageThreadDetail = {
  id: string;
  productId: string;
  productTitle: string;
  vendorName: string;
  messages: ListingMessageRow[];
};

export function formatMessageTime(
  iso: string,
  lang: LandingLang,
  nowMs?: number,
): string {
  return formatCommentTime(iso, lang, nowMs);
}

export function messageThreadInitials(label: string): string {
  const parts = label.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}