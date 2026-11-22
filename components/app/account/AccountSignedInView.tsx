"use client";

import { useState, type ReactNode } from "react";
import {
  ProfilePhotoUpload,
} from "@/components/app/ProfilePhotoUpload";
import { VerifiedBadge } from "@/components/app/product/VerifiedBadge";
import { AccountLangSheet } from "@/components/app/account/AccountLangSheet";
import { AccountSignOutSheet } from "@/components/app/account/AccountSignOutSheet";
import { persistAppMode, type AppMode } from "@/lib/nakuru/app-mode";
import {
  accountMenuRows,
  type AccountMenuRow,
  type AccountRowIcon,
  type VendorAccountSummary,
} from "@/lib/nakuru/vendor-profile";
import { useAssistantUi } from "@/components/app/assistant/AssistantUiProvider";
import { homeCopy } from "@/lib/nakuru/home-i18n";
import { APP_VERSION } from "@/lib/nakuru/app-meta";
import { requestOpenCartSegment } from "@/lib/nakuru/post-cart-segment";
import type { LandingLang } from "@/lib/nakuru/i18n";
import type { AuthUser } from "@/lib/nakuru/auth";
import {
  IconChevronRight,
  IconClock,
  IconClipboard,
  IconGlobe,
  IconHeart,
  IconLifeBuoy,
  IconLogOut,
  IconReceipt,
  IconStore,
  IconWallet,
} from "@/components/app/icons/LineIcons";
import { BrandLogoMark } from "@/components/app/BrandLogoMark";
import { installCopy } from "@/lib/nakuru/pwa-install-i18n";

type DispatchRow = (id: string) => void;

function displayInitials(name: string, email?: string): string {
  const src = name.trim() || email?.split("@")[0] || "?";
  const parts = src.split(/[\s._-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }
  return src.slice(0, 2).toUpperCase();
}

function rowIcon(icon: AccountRowIcon | "globe" | "install", size = 22): ReactNode {
  switch (icon) {
    case "store":
      return <IconStore size={size} />;
    case "receipt":
      return <IconReceipt size={size} />;
    case "heart":
      return <IconHeart size={size} />;
    case "lifebuoy":
      return <IconLifeBuoy size={size} />;
    case "clipboard":
      return <IconClipboard size={size} />;
    case "globe":
      return <IconGlobe size={size} />;
    case "install":
      return <BrandLogoMark size={size} className="" />;
    default:
      return null;
  }
}

type StatusChip =
  | { kind: "verified" }
  | { kind: "unverified" }
  | { kind: "pending" };

function accountStatusChip(
  profile: VendorAccountSummary | null,
): StatusChip | null {
  if (!profile) return null;
  if (profile.status === "pending") return { kind: "pending" };
  if (profile.status === "approved" && profile.verified) return { kind: "verified" };
  if (profile.status === "approved" && !profile.verified) return { kind: "unverified" };
  return null;
}

type Props = {
  user: AuthUser;
  photo: string;
  vendorProfile: VendorAccountSummary | null;
  lang: LandingLang;
  setLang: (lang: LandingLang) => void;
  standalone: boolean;
  onInstallRow: () => void;
  onDispatchRow: DispatchRow;
  onSelectMode: (mode: AppMode) => void;
  onSignOut: () => void;
};

function AccountMenuRowButton({
  row,
  valueLabel,
  onActivate,
}: {
  row: {
    icon: AccountRowIcon | "globe" | "install";
    label: string;
    sub?: string;
    disabled?: boolean;
    disabledReason?: string;
  };
  valueLabel?: string;
  onActivate: () => void;
}) {
  const disabled = row.disabled;
  return (
    <div
      className={`acc-menu-row${disabled ? " is-disabled" : ""}`}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled || undefined}
      onClick={() => {
        if (disabled) return;
        onActivate();
      }}
      onKeyDown={(e) => {
        if (disabled) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onActivate();
        }
      }}
    >
      <span
        className={`acc-menu-tile${row.icon === "install" ? " acc-menu-tile--brand" : ""}`}
        aria-hidden
      >
        {rowIcon(row.icon)}
      </span>
      <span className="acc-menu-copy">
        <span className="acc-menu-label">{row.label}</span>
        {row.sub ? <span className="acc-menu-sub m">{row.sub}</span> : null}
        {row.disabledReason ? (
          <span className="acc-menu-sub m">{row.disabledReason}</span>
        ) : null}
      </span>
      {valueLabel ? (
        <span className="acc-menu-value m">{valueLabel}</span>
      ) : null}
      <span className="acc-menu-chevron" aria-hidden>
        <IconChevronRight size={20} />
      </span>
    </div>
  );
}

export function AccountSignedInView({
  user,
  photo,
  vendorProfile,
  lang,
  setLang,
  standalone,
  onInstallRow,
  onDispatchRow,
  onSelectMode,
  onSignOut,
}: Props) {
  const { openAssistant } = useAssistantUi();
  const [langOpen, setLangOpen] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);

  const menuRows = accountMenuRows(vendorProfile, true);
  const selling = menuRows.filter((r) => r.section === "selling");
  const shopping = menuRows.filter((r) => r.section === "shopping");

  const displayName =
    user.email ?? homeCopy("accDefaultName", lang);
  const roleCaption = homeCopy("accRoleBuyer", lang);
  const chip = accountStatusChip(vendorProfile);
  const showGetVerified =
    vendorProfile?.status === "approved" && !vendorProfile.verified;

  const onRow = (row: AccountMenuRow) => {
    if (row.disabled) return;
    if (row.actionId === "tab:cart:orders") {
      requestOpenCartSegment("orders");
      onDispatchRow("tab:cart");
      return;
    }
    onDispatchRow(row.actionId);
  };

  const langTrail = `${homeCopy("accLanguageEn", lang)} / ${homeCopy("accLanguageSw", lang)}`;

  return (
  <>
    <div className="acc-identity card">
      <ProfilePhotoUpload
        className="acc-identity-av"
        role="button"
        aria-label={homeCopy("accUploadPhotoAria", lang)}
      >
        {photo ? (
          <img src={photo} alt="" className="acc-identity-photo" />
        ) : (
          <span className="acc-identity-initials" aria-hidden>
            {displayInitials(displayName, user.email)}
          </span>
        )}
      </ProfilePhotoUpload>
      <div className="acc-identity-copy">
        <div className="acc-identity-top">
          <div className="acc-identity-name">{displayName}</div>
          {chip ? (
            <div className="acc-identity-chip">
              {chip.kind === "verified" ? (
                <VerifiedBadge lang={lang} />
              ) : chip.kind === "pending" ? (
                <span className="acc-status-chip acc-status-chip--pending">
                  <IconClock size={14} aria-hidden />
                  {homeCopy("accStatusPending", lang)}
                </span>
              ) : (
                <span className="acc-status-chip acc-status-chip--muted">
                  <IconWallet size={14} aria-hidden />
                  {homeCopy("accStatusUnverified", lang)}
                </span>
              )}
            </div>
          ) : null}
        </div>
        <div className="acc-identity-role m">{roleCaption}</div>
        {user.email ? (
          <div className="acc-identity-email m">{user.email}</div>
        ) : null}
        <div
          className="acc-mode-seg"
          role="tablist"
          aria-label={homeCopy("accModeAria", lang)}
        >
          <button
            type="button"
            role="tab"
            className="acc-mode-seg__item"
            aria-selected="true"
            onClick={() => {
              persistAppMode("shopping");
              onSelectMode("shopping");
            }}
          >
            {homeCopy("accModeShopping", lang)}
          </button>
          <button
            type="button"
            role="tab"
            className="acc-mode-seg__item"
            aria-selected="false"
            onClick={() => {
              persistAppMode("selling");
              onSelectMode("selling");
            }}
          >
            {homeCopy("accModeSelling", lang)}
          </button>
        </div>
      </div>
    </div>

    {showGetVerified ? (
      <div className="acc-verify-card card">
        <div className="acc-verify-head">
          <VerifiedBadge lang={lang} locked />
          <h2 className="acc-verify-title">{homeCopy("accGetVerifiedTitle", lang)}</h2>
        </div>
        <p className="acc-verify-sub m">{homeCopy("accGetVerifiedSub", lang)}</p>
        <ul className="acc-verify-checklist" role="list">
          <li className="acc-verify-step is-pending">
            <IconClock size={18} aria-hidden />
            <span>{homeCopy("accVerifyStepId", lang)}</span>
          </li>
          <li className="acc-verify-step is-pending">
            <IconClock size={18} aria-hidden />
            <span>{homeCopy("accVerifyStepShop", lang)}</span>
          </li>
        </ul>
        <button
          type="button"
          className="btn full"
          onClick={() => onDispatchRow("acc:help")}
        >
          {homeCopy("accContactSupport", lang)}
        </button>
      </div>
    ) : null}

    {selling.length > 0 ? (
      <section className="acc-menu-section" aria-labelledby="acc-sec-selling">
        <h3 id="acc-sec-selling" className="acc-section-label">
          {homeCopy("accSectionSelling", lang)}
        </h3>
        <div className="acc-menu-group card">
          {selling.map((row) => (
            <AccountMenuRowButton
              key={row.actionId}
              row={{
                icon: row.icon,
                label: homeCopy(row.labelKey, lang),
                disabled: row.disabled,
                disabledReason: row.disabledReasonKey
                  ? homeCopy(row.disabledReasonKey, lang)
                  : undefined,
              }}
              onActivate={() => onRow(row)}
            />
          ))}
        </div>
      </section>
    ) : null}

    <section className="acc-menu-section" aria-labelledby="acc-sec-shopping">
      <h3 id="acc-sec-shopping" className="acc-section-label">
        {homeCopy("accSectionShopping", lang)}
      </h3>
      <div className="acc-menu-group card">
        {shopping.map((row) => (
          <AccountMenuRowButton
            key={row.actionId}
            row={{
              icon: row.icon,
              label: homeCopy(row.labelKey, lang),
            }}
            onActivate={() => onRow(row)}
          />
        ))}
      </div>
    </section>

    <section className="acc-menu-section" aria-labelledby="acc-sec-app">
      <h3 id="acc-sec-app" className="acc-section-label">
        {homeCopy("accSectionApp", lang)}
      </h3>
      <div className="acc-menu-group card">
        <AccountMenuRowButton
          row={{
            icon: "lifebuoy",
            label: homeCopy("assistantEntryHelp", lang),
            sub:
              lang === "sw"
                ? "Maswali kuhusu malipo na usafirishaji"
                : "Questions about payments and delivery",
          }}
          onActivate={() =>
            openAssistant({ screen: "help", source: "account-help" })
          }
        />
        {!standalone ? (
          <AccountMenuRowButton
            row={{
              icon: "install",
              label: installCopy("installRow", lang),
              sub: homeCopy("accInstallSub", lang),
            }}
            onActivate={onInstallRow}
          />
        ) : null}
        <AccountMenuRowButton
          row={{
            icon: "globe",
            label: homeCopy("accLanguage", lang),
          }}
          valueLabel={langTrail}
          onActivate={() => setLangOpen(true)}
        />
        <AccountMenuRowButton
          row={{
            icon: "lifebuoy",
            label: homeCopy("accHelp", lang),
          }}
          onActivate={() =>
            openAssistant({ screen: "help", source: "account-help-row" })
          }
        />
      </div>
    </section>

    <div className="acc-signout-block">
      <button
        type="button"
        className="acc-signout-row"
        onClick={() => setSignOutOpen(true)}
      >
        <span className="acc-menu-tile acc-menu-tile--danger" aria-hidden>
          <IconLogOut size={20} />
        </span>
        <span className="acc-signout-label">{homeCopy("accSignOut", lang)}</span>
      </button>
      <p className="acc-footer m">
        {homeCopy("accFooter", lang)}
        <span className="acc-footer-ver" aria-label={`Version ${APP_VERSION}`}>
          {" "}
          · v{APP_VERSION}
        </span>
      </p>
    </div>

    <AccountLangSheet
      open={langOpen}
      lang={lang}
      onClose={() => setLangOpen(false)}
      onSelect={setLang}
    />
    <AccountSignOutSheet
      open={signOutOpen}
      lang={lang}
      onConfirm={onSignOut}
      onClose={() => setSignOutOpen(false)}
    />
  </>
  );
}