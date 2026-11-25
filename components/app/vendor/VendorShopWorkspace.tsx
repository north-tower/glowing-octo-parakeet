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
import { ShopBannerUpload } from "@/components/app/vendor/ShopBannerUpload";
import { VendorStockPanel } from "@/components/app/vendor/VendorStockPanel";
import { apiFetch, ApiError } from "@/lib/nakuru/api";
import {
  vendorStatusLabel,
  type ApiVendorRow,
} from "@/lib/nakuru/vendor-profile";
import { useDetectNakuruZone } from "@/components/app/useDetectNakuruZone";
import { useEffect, useRef, useState, type FormEvent } from "react";

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
  onBannerChange: (bannerUrl: string) => void;
  onWhatsAppChange: (whatsapp: string | null) => void;
};

export function VendorShopWorkspace({
  vendor,
  photo,
  toast,
  onAreaChange,
  onBannerChange,
  onWhatsAppChange,
}: Props) {
  const { lang } = usePwaInstall();
  const [tab, setTab] = useState<TabId>("add");
  const [zoneOpen, setZoneOpen] = useState(false);
  const [areaBusy, setAreaBusy] = useState(false);
  const [whatsapp, setWhatsapp] = useState(vendor.whatsapp ?? "");
  const [waBusy, setWaBusy] = useState(false);
  const [stockTick, setStockTick] = useState(0);
  const zoneBtnRef = useRef<HTMLButtonElement>(null);
  const { detect: detectZone, busy: detectBusy } = useDetectNakuruZone(toast, lang);

  useEffect(() => {
    setWhatsapp(vendor.whatsapp ?? "");
  }, [vendor.whatsapp]);

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

  const saveWhatsApp = async (ev: FormEvent) => {
    ev.preventDefault();
    if (waBusy) return;
    const trimmed = whatsapp.trim();
    setWaBusy(true);
    try {
      const row = await apiFetch<{ whatsapp: string | null }>(
        "/api/vendors/mine",
        {
          method: "PATCH",
          body: JSON.stringify({ whatsapp: trimmed }),
        },
      );
      onWhatsAppChange(row.whatsapp ?? null);
      setWhatsapp(row.whatsapp ?? "");
      toast(
        row.whatsapp
          ? "WhatsApp saved. Buyers will see it on your listings."
          : "WhatsApp number removed.",
      );
    } catch (err) {
      if (err instanceof ApiError && err.body.error === "bad_request") {
        toast("Enter a valid Kenyan mobile, e.g. 0712 345 678.");
      } else if (
        err instanceof ApiError &&
        err.body.error === "no_approved_vendor"
      ) {
        toast("Your shop must be approved before saving WhatsApp.");
      } else {
        toast("Could not save WhatsApp.");
      }
    } finally {
      setWaBusy(false);
    }
  };

  const useMyLocation = async () => {
    const zone = await detectZone();
    if (!zone) return;
    setZoneOpen(false);
    await saveArea(zone);
  };

  return (
    <>
      <ShopBannerUpload
        bannerUrl={vendor.banner_url}
        toast={toast}
        disabled={areaBusy}
        onUploaded={onBannerChange}
      />
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
          <div className="shop-zone-row">
            <button
              type="button"
              ref={zoneBtnRef}
              className="shop-zone-chip"
              aria-haspopup="dialog"
              aria-expanded={zoneOpen}
              disabled={areaBusy || detectBusy}
              onClick={() => setZoneOpen(true)}
            >
              <IconMapPin size={16} />
              <span>
                {vendor.area ? `Shop area: ${vendor.area}` : "Set shop area"}
              </span>
              <IconChevronDown size={16} />
            </button>
            {!vendor.area ? (
              <button
                type="button"
                className="btn s shop-zone-locate"
                disabled={areaBusy || detectBusy}
                onClick={() => void useMyLocation()}
              >
                {detectBusy
                  ? lang === "sw"
                    ? "Inatafuta…"
                    : "Locating…"
                  : lang === "sw"
                    ? "Tumia eneo langu"
                    : "Use my location"}
              </button>
            ) : null}
          </div>
          <form className="shop-wa" onSubmit={(ev) => void saveWhatsApp(ev)}>
            <label htmlFor="shop-wa">WhatsApp number</label>
            <p className="m">
              Shown on every listing as WhatsApp seller. Kenyan mobile only.
            </p>
            <div className="row shop-wa-row">
              <input
                id="shop-wa"
                maxLength={16}
                autoComplete="tel"
                inputMode="tel"
                placeholder="0712 345 678"
                value={whatsapp}
                disabled={waBusy}
                onChange={(e) => setWhatsapp(e.target.value)}
              />
              <button type="submit" className="btn s" disabled={waBusy}>
                {waBusy ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
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
          vendorCategories={vendor.categories}
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
        onUseLocation={() => void useMyLocation()}
        useLocationBusy={detectBusy || areaBusy}
      />
    </>
  );
}
