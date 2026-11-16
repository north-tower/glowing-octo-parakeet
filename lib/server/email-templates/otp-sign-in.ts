import { BRAND_LOGO, BRAND_NAME } from "@/lib/nakuru/brand";

function escHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function displayNameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "";
  const name = local.replace(/[._+-]+/g, " ").trim();
  if (!name) return "there";
  return name
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export type OtpSignInMailContent = { text: string; html: string };

/** Transactional OTP email — table layout, inline styles for client compatibility. */
export function buildOtpSignInMail(
  email: string,
  code: string,
): OtpSignInMailContent {
  const name = displayNameFromEmail(email);
  const safeCode = escHtml(code);

  const text = [
    `Hello ${name},`,
    "",
    `Your ${BRAND_NAME} sign-in code is ${code}.`,
    "It is valid for 5 minutes.",
    "",
    `Never share this code with anyone. ${BRAND_NAME} will never ask for it by phone or message.`,
    "",
    "If you did not request this code, you can ignore this email.",
  ].join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>Your ${BRAND_NAME} sign-in code</title>
</head>
<body style="margin:0;padding:0;background:#eef4f3;font-family:Segoe UI,Helvetica,Arial,sans-serif;color:#16292a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef4f3;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:4px;overflow:hidden;box-shadow:0 2px 8px rgba(13,41,42,.08);">
          <tr>
            <td style="background:#0d5c58;padding:16px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:20px;font-weight:700;letter-spacing:.02em;color:#ffffff;"><span style="font-size:26px;line-height:1;vertical-align:middle;">${BRAND_LOGO}</span> ${escHtml(BRAND_NAME)}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="height:4px;background:#a86f00;font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="height:6px;background:#0d6f69;font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="background:linear-gradient(120deg,#0d6f69 0%,#0d5c58 55%,#073b39 100%);padding:28px 24px;text-align:center;">
              <p style="margin:0 0 8px;font-size:22px;font-weight:600;color:#ffffff;line-height:1.3;">Sign-in verification</p>
              <p style="margin:0;font-size:11px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:rgba(255,255,255,.88);">Local market &nbsp;|&nbsp; Trusted sellers</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 24px 8px;font-size:15px;line-height:1.55;color:#16292a;">
              <p style="margin:0 0 16px;">Hello <strong>${escHtml(name)}</strong>,</p>
              <p style="margin:0 0 20px;color:#62777a;">Use this one-time code to sign in to your ${escHtml(BRAND_NAME)} account. It expires in <strong style="color:#16292a;">5 minutes</strong>.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 24px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fdf1d3;border:1px solid #e8d4a8;border-radius:12px;">
                <tr>
                  <td style="padding:20px 16px;text-align:center;">
                    <p style="margin:0 0 10px;font-size:12px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:#a86f00;">Your sign-in code</p>
                    <p style="margin:0;font-size:32px;font-weight:700;letter-spacing:.35em;font-variant-numeric:tabular-nums;color:#16292a;">${safeCode}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 24px 28px;font-size:14px;line-height:1.55;color:#62777a;">
              <p style="margin:0 0 12px;">For your security, never share this code. ${escHtml(BRAND_NAME)} staff will not ask you for it.</p>
              <p style="margin:0;">If you did not request a sign-in code, you can ignore this email — your account stays secure.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 24px;background:#f1f6f5;border-top:1px solid #dde7e6;font-size:11px;line-height:1.45;color:#62777a;text-align:center;">
              ${BRAND_LOGO} ${escHtml(BRAND_NAME)} &middot; Nakuru County marketplace
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { text, html };
}