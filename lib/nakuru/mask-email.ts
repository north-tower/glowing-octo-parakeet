/** Mask an email for display, e.g. j***@gmail.com */
export function maskEmail(email: string): string {
  const at = email.indexOf("@");
  if (at <= 0) return email;
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  const head = local.length <= 1 ? local : local[0];
  return `${head}***@${domain}`;
}