import { PHONE_REGEX } from "@/lib/nakuru/data/constants";

function kenyanIntlDigits(phone: string): string | null {
  const raw = phone.trim();
  if (!PHONE_REGEX.test(raw.replace(/[\s-]/g, ""))) return null;
  const digits = raw.replace(/\D/g, "");
  return digits.startsWith("0") ? `254${digits.slice(1)}` : digits;
}

/** Build a WhatsApp click-to-chat URL, or null if the number is not a Kenyan mobile. */
export function toWhatsAppHref(phone: string, text: string): string | null {
  const intl = kenyanIntlDigits(phone);
  if (!intl) return null;
  const href = `https://wa.me/${intl}`;
  const msg = text.trim();
  if (!msg) return href;
  return `${href}?text=${encodeURIComponent(msg)}`;
}

export function toTelHref(phone: string): string | null {
  const intl = kenyanIntlDigits(phone);
  return intl ? `tel:+${intl}` : null;
}
