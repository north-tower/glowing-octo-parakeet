/** Staff session access JWT (separate from customer `lib/nakuru/auth`). */

const STORAGE_KEY = "nakuruhub-staff-access";

export function getStaffAccessToken(): string | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStaffAccessToken(token: string | null): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    if (token) sessionStorage.setItem(STORAGE_KEY, token);
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* quota / private mode */
  }
}

export function clearStaffAccessToken(): void {
  setStaffAccessToken(null);
}