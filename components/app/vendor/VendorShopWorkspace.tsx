"use client";

import {
  Avatar,
  ProfilePhotoUpload,
} from "@/components/app/ProfilePhotoUpload";
import { usePwaInstall } from "@/components/app/pwa/InstallProvider";
import { IconChevronDown, IconMapPin } from "@/components/app/icons/LineIcons";
import { ZoneSheet } from "@/components/app/ZoneSheet";
import { VendorEarningsPanel } from "@/components/app/vendor/VendorEarningsPanel";
import { VendorOrdersPanel } from "@/components/app/vendor/VendorOrdersPanel";
import { VendorProductForm } from "@/components/app/vendor/VendorProductForm";
import { VendorStockPanel } from "@/components/app/vendor/VendorStockPanel";
import { apiFetch, ApiError } from "@/lib/nakuru/api";
import {
  vendorStatusLabel,
  type ApiVendorRow,
} from "@/lib/nakuru/vendor-profile";
import { useRef, useState } from "react";

type TabId = "add" | "stock" | "orders" | "earn";

const TABS: { id: TabId; label: string }[] = [
  { id: "add", label: "Add listing" },
  { id: "stock", label: "Stock" },
  { id: "orders", label: "Orders" },
  { id: "earn", label: "Earnings" },
];

type Props = {
  vendor: ApiVendorRow;
  photo: string;
  toast: (msg: string) => void;
  onAreaChange: (area: string) => void;
};

export function VendorShopWorkspace({
  vendor,
  photo,
  toast,
  onAreaChange,
}: Props) {
  const { lang } = usePwaInstall();
  const [tab, setTab] = useState<TabId>("add");
  const [zoneOpen, setZoneOpen] = useState(false);
  const [areaBusy, setAreaBusy] = useState(false);
  const [stockTick, setStockTick] = useState(0);
  const zoneBtnRef = useRef<HTMLButtonElement>(null);

  const saveArea = async (area: string) => {
    if (areaBusy || area === vendor.area) return;
    setAreaBusy(true);
    try {
      await apiFetch("/api/vendors/mine", {
        method: "PATCH",
        body: JSON.stringify({ area }),
      });
      onAreaChange(area);
      toast(`Shop area set to ${area}.`);
    } catch (err) {
      if (err instanceof ApiError && err.body.error === "no_approved_vendor") {
        toast("Your shop must be approved before setting an area.");
      } else {
        toast("Could not save shop area.");
      }
    } finally {
      setAreaBusy(false);
    }
  };

  return (
    <>
      <div className="card row">
        <ProfilePhotoUpload
          className="pfp"
          role="button"
          aria-label="Upload profile picture"
        >
          <Avatar photo={photo} />
          <b>📷</b>
        </ProfilePhotoUpload>
        <div className="shop-profile-copy">
          <div className="t">{vendor.name}</div>
          <div className="m">
            Status: {vendorStatusLabel(vendor.status)} ·{" "}
            {vendor.verified
              ? "Verified (M-Pesa upfront enabled)"
              : "Basic (cash on delivery only)"}
          </div>
          <button
            type="button"
            ref={zoneBtnRef}
            className="shop-zone-chip"
            aria-haspopup="dialog"
            aria-expanded={zoneOpen}
            disabled={areaBusy}
            onClick={() => setZoneOpen(true)}
          >
            <IconMapPin size={16} />
            <span>
              {vendor.area ? `Shop area: ${vendor.area}` : "Set shop area"}
            </span>
            <IconChevronDown size={16} />
          </button>
        </div>
      </div>

      <div className="shop-tabs" role="tablist" aria-label="Shop tools">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={`shop-tab${tab === item.id ? " on" : ""}`}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "add" ? (
        <VendorProductForm
          vendorId={vendor.id}
          shopArea={vendor.area}
          toast={toast}
          onPublished={() => setStockTick((n) => n + 1)}
        />
      ) : null}
      {tab === "stock" ? (
        <VendorStockPanel toast={toast} reloadToken={stockTick} />
      ) : null}
      {tab === "orders" ? <VendorOrdersPanel toast={toast} /> : null}
      {tab === "earn" ? <VendorEarningsPanel /> : null}

      <ZoneSheet
        open={zoneOpen}
        area={vendor.area ?? ""}
        lang={lang}
        nakuruOnly
        variant="sheet"
        anchorRef={zoneBtnRef}
        onClose={() => setZoneOpen(false)}
        onSelect={(area) => {
          setZoneOpen(false);
          void saveArea(area);
        }}
      />
    </>
  );
}
