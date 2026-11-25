"use client";

import {
  IconChevronRight,
  IconHeart,
  IconReceipt,
  IconSparkle,
  IconStore,
} from "@/components/app/icons/LineIcons";
import { BrandLogoMark } from "@/components/app/BrandLogoMark";
import { useAssistantUi } from "@/components/app/assistant/AssistantUiProvider";
import { usePwaInstall } from "@/components/app/pwa/InstallProvider";
import { homeCopy } from "@/lib/nakuru/home-i18n";
import { installCopy } from "@/lib/nakuru/pwa-install-i18n";
import { readInstalled } from "@/lib/nakuru/pwa-engage";
import type { SignInIntent } from "@/components/app/auth/SignInForm";

type Props = {
  onNeedSignIn: (intent: Exclude<SignInIntent, null>) => void;
  onSell: () => void;
};

export function AccountGuestPanel({ onNeedSignIn, onSell }: Props) {
  const { lang, standalone, openInstallSheet } = usePwaInstall();
  const { openAssistant } = useAssistantUi();
  const hideInstall = standalone || readInstalled();

  return (
    <>
      <section className="acc-guest-section" aria-labelledby="acc-guest-label">
        <h2 id="acc-guest-label" className="acc-guest-label">
          {homeCopy("signInGuestBrowse", lang)}
        </h2>
        <p className="sign-in-guest-note acc-guest-note">
          {homeCopy("signInGuestNote", lang)}
        </p>
        <div className="acc-menu-group card">
          <button
            type="button"
            className="acc-menu-row acc-menu-row--featured"
            onClick={() =>
              openAssistant({ screen: "help", source: "account-signed-out" })
            }
          >
            <span className="acc-menu-tile" aria-hidden>
              <IconSparkle size={22} />
            </span>
            <span className="acc-menu-copy">
              <span className="acc-menu-label">
                {homeCopy("assistantEntryAccount", lang)}
              </span>
            </span>
            <span className="acc-menu-chevron" aria-hidden>
              <IconChevronRight size={20} />
            </span>
          </button>
          {!hideInstall ? (
            <button
              type="button"
              className="acc-menu-row"
              onClick={() => openInstallSheet("account")}
            >
              <span className="acc-menu-tile acc-menu-tile--brand" aria-hidden>
                <BrandLogoMark size={22} />
              </span>
              <span className="acc-menu-copy">
                <span className="acc-menu-label">
                  {installCopy("installRow", lang)}
                </span>
              </span>
              <span className="acc-menu-chevron" aria-hidden>
                <IconChevronRight size={20} />
              </span>
            </button>
          ) : null}
          <button
            type="button"
            className="acc-menu-row"
            onClick={() => onNeedSignIn("orders")}
          >
            <span className="acc-menu-tile" aria-hidden>
              <IconReceipt size={22} />
            </span>
            <span className="acc-menu-copy">
              <span className="acc-menu-label">{homeCopy("accMyOrders", lang)}</span>
            </span>
            <span className="acc-menu-chevron" aria-hidden>
              <IconChevronRight size={20} />
            </span>
          </button>
          <button
            type="button"
            className="acc-menu-row"
            onClick={() => onNeedSignIn("saved")}
          >
            <span className="acc-menu-tile" aria-hidden>
              <IconHeart size={22} />
            </span>
            <span className="acc-menu-copy">
              <span className="acc-menu-label">{homeCopy("accSaved", lang)}</span>
            </span>
            <span className="acc-menu-chevron" aria-hidden>
              <IconChevronRight size={20} />
            </span>
          </button>
        </div>
      </section>

      <button type="button" className="acc-sell-promo" onClick={onSell}>
        <span className="acc-menu-tile" aria-hidden>
          <IconStore size={22} />
        </span>
        <span className="acc-menu-copy">
          <span className="acc-menu-label">{homeCopy("accSell", lang)}</span>
          <span className="acc-menu-sub m">{homeCopy("accSellPromoSub", lang)}</span>
        </span>
        <span className="acc-menu-chevron" aria-hidden>
          <IconChevronRight size={20} />
        </span>
      </button>
    </>
  );
}
