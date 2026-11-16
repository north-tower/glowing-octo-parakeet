const ADDRESS_KEY = "nh:checkout-address";
const PHONE_KEY = "nh:checkout-phone";

export function readCheckoutAddress(): string {
  try {
    return sessionStorage.getItem(ADDRESS_KEY) ?? localStorage.getItem(ADDRESS_KEY) ?? "";
  } catch {
    return "";
  }
}

export function readCheckoutPhone(): string {
  try {
    return sessionStorage.getItem(PHONE_KEY) ?? localStorage.getItem(PHONE_KEY) ?? "";
  } catch {
    return "";
  }
}

export function writeCheckoutFields(address: string, phone: string): void {
  try {
    localStorage.setItem(ADDRESS_KEY, address);
    localStorage.setItem(PHONE_KEY, phone);
  } catch {
    /* private mode */
  }
}

export function clearCheckoutFields(): void {
  try {
    localStorage.removeItem(ADDRESS_KEY);
    localStorage.removeItem(PHONE_KEY);
  } catch {
    /* private mode */
  }
}

export function hasCheckoutFieldsSaved(): boolean {
  return Boolean(readCheckoutAddress().trim() || readCheckoutPhone().trim());
}