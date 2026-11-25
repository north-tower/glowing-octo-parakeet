export type ApiVendorRow = {
  id: string;
  name: string;
  categories: string[];
  status: string;
  verified: boolean;
  logo_url: string | null;
  banner_url: string | null;
  area: string | null;
  whatsapp: string | null;
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

export type AccountRowIcon =
  | "store"
  | "receipt"
  | "heart"
  | "lifebuoy"
  | "clipboard"
  | "map";

export type AccountMenuRow = {
  icon: AccountRowIcon;
  actionId: string;
  /** i18n key resolved in AccountView */
  labelKey:
    | "accMyShop"
    | "accOrdersBuyer"
    | "accSaved"
    | "accHelp"
    | "accApplicationStatus"
    | "accApplyAgain"
    | "accSell"
    | "accMyOrders"
    | "accAddresses";
  disabled?: boolean;
  disabledReasonKey?: "accShopAfterApproval";
  section: "selling" | "shopping";
};

/** Signed-out rows (labels still English; signed-out pass not redesigned). */
export type AccountMenuRowLegacy = [icon: string, label: string, actionId: string];

function signedInShoppingTail(): AccountMenuRow[] {
  return [
    {
      icon: "heart",
      actionId: "acc:saved",
      labelKey: "accSaved",
      section: "shopping",
    },
    {
      icon: "map",
      actionId: "acc:addresses",
      labelKey: "accAddresses",
      section: "shopping",
    },
  ];
}

/** Account tab list items — differs for shoppers vs vendor lifecycle. */
export function accountMenuRows(
  profile: VendorAccountSummary | null,
  signedIn = false,
): AccountMenuRow[] {
  const tail = signedIn ? signedInShoppingTail() : [];

  if (profile?.status === "approved") {
    return [
      {
        icon: "store",
        actionId: "acc:vendor",
        labelKey: "accMyShop",
        section: "selling",
      },
      {
        icon: "receipt",
        actionId: "tab:cart:orders",
        labelKey: "accOrdersBuyer",
        section: "shopping",
      },
      ...tail,
    ];
  }

  if (profile?.status === "pending") {
    return [
      {
        icon: "store",
        actionId: "acc:vendor",
        labelKey: "accApplicationStatus",
        section: "selling",
      },
      {
        icon: "receipt",
        actionId: "tab:cart:orders",
        labelKey: "accOrdersBuyer",
        section: "shopping",
      },
      ...tail,
    ];
  }

  if (profile?.status === "rejected") {
    return [
      {
        icon: "store",
        actionId: "acc:vendor",
        labelKey: "accApplyAgain",
        section: "selling",
      },
      {
        icon: "receipt",
        actionId: "tab:cart:orders",
        labelKey: "accOrdersBuyer",
        section: "shopping",
      },
      ...tail,
    ];
  }

  if (!profile && signedIn) {
    return [
      {
        icon: "store",
        actionId: "acc:vendor",
        labelKey: "accSell",
        section: "selling",
      },
      {
        icon: "receipt",
        actionId: "tab:cart:orders",
        labelKey: "accOrdersBuyer",
        section: "shopping",
      },
      ...tail,
    ];
  }

  return [
    {
      icon: "receipt",
      actionId: "tab:cart:orders",
      labelKey: "accMyOrders",
      section: "shopping",
    },
    {
      icon: "store",
      actionId: "acc:vendor",
      labelKey: "accSell",
      section: "selling",
    },
    ...tail,
  ];
}

/** Legacy emoji rows for signed-out account list only. */
export function accountMenuRowsSignedOut(): AccountMenuRowLegacy[] {
  return [
    ["📦", "My orders", "tab:cart"],
    ["🏪", "Sell on NakuruHub", "acc:vendor"],
    ["❤️", "Saved items", "acc:saved"],
    ["❓", "Help and support", "acc:help"],
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