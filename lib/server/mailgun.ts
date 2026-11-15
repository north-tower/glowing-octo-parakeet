import { config } from "./config";

export type SendMailParams = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

export async function sendMail({
  to,
  subject,
  text,
  html,
}: SendMailParams): Promise<void> {
  const { key, domain, from } = config.mailgun;
  if (!key || !domain) {
    if (config.env === "production") {
      throw new Error("Mailgun not configured");
    }
    console.log("[dev mail]", to, subject, text);
    return;
  }

  const body = new URLSearchParams({
    from,
    to,
    subject,
    text,
    ...(html ? { html } : {}),
  });

  const res = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`api:${key}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!res.ok) {
    throw new Error(`Mailgun error ${res.status}`);
  }
}