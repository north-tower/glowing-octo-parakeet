"use client";

import Image from "next/image";
import { useDashboardTabs } from "@/components/landing/hooks/useDashboardTabs";

const SHOTS = [
  {
    id: "stock",
    en: "Stock",
    sw: "Stoki",
    src: "/images/dashboard/stock.png",
    width: 391,
    height: 1024,
    altEn: "Seller stock list in the NakuruHub shop dashboard",
  },
  {
    id: "orders",
    en: "Orders",
    sw: "Oda",
    src: "/images/dashboard/orders.png",
    width: 419,
    height: 1024,
    altEn: "Seller orders and quote requests in the NakuruHub shop dashboard",
  },
] as const;

export function DashboardSection() {
  useDashboardTabs();
  return (
    <section
      id="dashboard"
      className="section-dashboard reveal-section"
      aria-labelledby="dashboard-heading"
    >
      <div className="wrap">
        <p className="section-eyebrow">
          <span className="section-eyebrow-line" aria-hidden="true"></span>
          <span data-en="03 Your dashboard" data-sw="03 Dashibodi yako">
            03 Your dashboard
          </span>
        </p>
        <h2
          id="dashboard-heading"
          data-en="See your shop at a glance"
          data-sw="Angalia duka lako kwa ufupi"
        >
          See your shop at a glance
        </h2>
        <p
          className="section-intro mut"
          data-en="Each category has its own dashboard."
          data-sw="Kila kategoria ina dashibodi yake."
        >
          Each category has its own dashboard.
        </p>
        <div className="dash-browser" data-dash-root>
          <div className="dash-chrome" aria-hidden="true">
            <span className="dash-dot"></span>
            <span className="dash-dot"></span>
            <span className="dash-dot"></span>
          </div>
          <div className="dash-body">
            <div
              className="dash-rail"
              role="tablist"
              aria-label="Dashboard sections"
              data-en-aria="Dashboard sections"
              data-sw-aria="Sehemu za dashibodi"
            >
              {SHOTS.map((shot, i) => (
                <button
                  key={shot.id}
                  type="button"
                  className="dash-tab"
                  role="tab"
                  id={`dash-tab-${shot.id}`}
                  aria-selected={i === 0 ? "true" : "false"}
                  aria-controls={`dash-panel-${shot.id}`}
                  tabIndex={i === 0 ? 0 : -1}
                  data-dash-tab={shot.id}
                  data-en={shot.en}
                  data-sw={shot.sw}
                >
                  {shot.en}
                </button>
              ))}
            </div>
            <div className="dash-panels" id="dash-panels">
              {SHOTS.map((shot, i) => (
                <div
                  key={shot.id}
                  className={`dash-panel${i === 0 ? " is-active" : ""}`}
                  role="tabpanel"
                  id={`dash-panel-${shot.id}`}
                  aria-labelledby={`dash-tab-${shot.id}`}
                  data-dash-panel={shot.id}
                  hidden={i !== 0}
                >
                  <Image
                    className="dash-shot"
                    src={shot.src}
                    width={shot.width}
                    height={shot.height}
                    alt={shot.altEn}
                    sizes="(max-width: 720px) 92vw, 26rem"
                    priority={i === 0}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        <p
          className="dash-caption mut"
          data-en="The live seller dashboard — stock, orders, and quotes in one place."
          data-sw="Dashibodi halisi ya muuzaji — stoki, oda, na maombi ya bei pamoja."
        >
          The live seller dashboard — stock, orders, and quotes in one place.
        </p>
      </div>
    </section>
  );
}
