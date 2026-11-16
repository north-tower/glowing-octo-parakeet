export type SignInIntent = "shop" | "seller";

export function intentFromStartParam(
  start: string | null,
  hasVendorQueryFlag: boolean,
): SignInIntent {
  if (start === "vendor" || hasVendorQueryFlag) return "seller";
  return "shop";
}

export type SignInCopy = {
  emailTitle: string;
  emailLead: string;
  emailCta: string;
  codeTitle: string;
  codeVerifyCta: string;
  successToast: string;
  switchLabel: string;
};

const COPY: Record<SignInIntent, SignInCopy> = {
  shop: {
    emailTitle: "Shop sign-in",
    emailLead:
      "Save orders, cart, and quote requests. We email a one-time code — no password.",
    emailCta: "Send code",
    codeTitle: "Confirm shop sign-in",
    codeVerifyCta: "Verify and sign in",
    successToast: "Signed in",
    switchLabel: "Selling on NakuruHub? Seller sign-in",
  },
  seller: {
    emailTitle: "Seller sign-in",
    emailLead:
      "Use the email for your shop. Same code login as shoppers — after sign-in you can apply to sell.",
    emailCta: "Send code",
    codeTitle: "Confirm seller sign-in",
    codeVerifyCta: "Verify and continue",
    successToast: "Signed in — seller tools are ready",
    switchLabel: "Just shopping? Shop sign-in",
  },
};

export function signInCopy(intent: SignInIntent): SignInCopy {
  return COPY[intent];
}