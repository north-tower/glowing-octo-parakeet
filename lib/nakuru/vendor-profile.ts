export type ApiVendorRow = {
  id: string;
  name: string;
  categories: string[];
  status: string;
  verified: boolean;
  created_at: string;
};

export function pickPrimaryVendor(rows: ApiVendorRow[]): ApiVendorRow | null {
  if (!rows.length) return null;
  const active = rows.find(
    (r) => r.status === "pending" || r.status === "approved",
  );
  return active ?? rows[0]!;
}

export function vendorStatusLabel(status: string): string {
  if (status === "approved") return "Approved";
  if (status === "rejected") return "Rejected";
  if (status === "pending") return "Pending";
  return status;
}

export type VendorAccountSummary = {
  name: string;
  status: string;
  verified: boolean;
};

export function accountVendorSubtitle(
  profile: VendorAccountSummary | null,
  role: string,
): string {
  if (!profile) return `Signed in · ${role}`;
  const st = vendorStatusLabel(profile.status);
  if (profile.status === "pending") {
    return `Vendor · ${st} — waiting for staff review`;
  }
  if (profile.status === "rejected") {
    return `Vendor · ${st} — you can apply again`;
  }
  if (profile.verified) {
    return `Vendor · ${st} · ✓ Verified (M-Pesa upfront)`;
  }
  return `Vendor · ${st} · Unverified (cash on delivery only)`;
}

export type AccountMenuRow = [icon: string, label: string, actionId: string];

function signedInAccountTail(): AccountMenuRow[] {
  return [
    ["❤️", "Saved items", "acc:saved"],
    ["❓", "Help and support", "acc:help"],
  ];
}

/** Account tab list items — differs for shoppers vs vendor lifecycle. */
export function accountMenuRows(
  profile: VendorAccountSummary | null,
  signedIn = false,
): AccountMenuRow[] {
  const tail = signedIn ? signedInAccountTail() : [];

  if (profile?.status === "approved") {
    return [
      ["🏪", "My shop", "acc:vendor"],
      ["📦", "Orders as buyer", "tab:cart"],
      ...tail,
    ];
  }

  if (profile?.status === "pending") {
    return [
      ["📋", "Application status", "acc:vendor"],
      ["📦", "My orders", "tab:cart"],
      ...tail,
    ];
  }

  if (profile?.status === "rejected") {
    return [
      ["🏪", "Apply again", "acc:vendor"],
      ["📦", "My orders", "tab:cart"],
      ...tail,
    ];
  }

  return [
    ["📦", "My orders", "tab:cart"],
    ["🏪", "Sell on NakuruHub", "acc:vendor"],
    ...tail,
  ];
}

export function accountHeaderVendorLine(
  profile: VendorAccountSummary | null,
): string | null {
  if (!profile) return null;
  if (profile.status === "pending") {
    return "Vendor application under review";
  }
  if (profile.status === "approved" && !profile.verified) {
    return "Unverified vendor — cash on delivery only until ID is checked";
  }
  if (profile.status === "approved" && profile.verified) {
    return `Verified vendor · ${profile.name}`;
  }
  if (profile.status === "rejected") {
    return "Vendor application not approved";
  }
  return null;
}