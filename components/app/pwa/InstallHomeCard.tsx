"use client";

import { BrandLogoMark } from "@/components/app/BrandLogoMark";
import { usePwaInstall } from "@/components/app/pwa/InstallProvider";
import { useNakuruApp } from "@/components/app/AppProvider";

export function InstallHomeCard() {
  const { state } = useNakuruApp();
  const { standalone, homeCardVisible, dismissHomeCard, openInstallSheet, t } =
    usePwaInstall();

  const onDefaultHome =
    state.tab === "home" &&
    state.cat === "all" &&
    !state.q.trim() &&
    !standalone;

  const show = onDefaultHome && homeCardVisible;

  return (
    <div
      className={`pwa-install-slot${show ? " is-open" : ""}`}
      aria-live="polite"
      aria-hidden={!show}
    >
      {show ? (
      <div className="pwa-install-card card">
        <div className="pwa-install-card-img" aria-hidden>
          <BrandLogoMark size={36} />
        </div>
        <div className="pwa-install-card-copy">
          <div className="t">{t("installCardTitle")}</div>
          <p className="m">{t("installCardBody")}</p>
        </div>
        <div className="pwa-install-card-actions">
          <button type="button" className="btn s" onClick={() => openInstallSheet("card")}>
            {t("installBtn")}
          </button>
          <button
            type="button"
            className="pwa-install-close"
            aria-label={t("closeAria")}
            onClick={dismissHomeCard}
          >
            <span aria-hidden>×</span>
          </button>
        </div>
      </div>
      ) : null}
    </div>
  );
}