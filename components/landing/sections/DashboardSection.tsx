"use client";

import Link from "next/link";
import { useDashboardTabs } from "@/components/landing/hooks/useDashboardTabs";

export function DashboardSection() {
  useDashboardTabs();
  return (
    <>
      <section id="dashboard" className="section-dashboard reveal-section" aria-labelledby="dashboard-heading">
          <div className="wrap">
            <p className="section-eyebrow"><span className="section-eyebrow-line" aria-hidden="true"></span><span data-en="03 Your dashboard" data-sw="03 Dashibodi yako">03 Your dashboard</span></p>
            <h2 id="dashboard-heading" data-en="See your shop at a glance" data-sw="Angalia duka lako kwa ufupi">See your shop at a glance</h2>
            <p className="section-intro mut" data-en="Each category has its own dashboard." data-sw="Kila kategoria ina dashibodi yake.">Each category has its own dashboard.</p>
            <div className="dash-browser" data-dash-root>
              <div className="dash-chrome" aria-hidden="true"><span className="dash-dot"></span><span className="dash-dot"></span><span className="dash-dot"></span></div>
              <div className="dash-body">
                <div className="dash-rail" role="tablist" aria-label="Dashboard sections" data-en-aria="Dashboard sections" data-sw-aria="Sehemu za dashibodi">
                  <button type="button" className="dash-tab" role="tab" id="dash-tab-products" aria-selected="false" aria-controls="dash-panel-products" tabIndex={-1} data-dash-tab="products" data-en="Products" data-sw="Bidhaa">Products</button>
                  <button type="button" className="dash-tab" role="tab" id="dash-tab-orders" aria-selected="true" aria-controls="dash-panel-orders" tabIndex={0} data-dash-tab="orders" data-en="Orders" data-sw="Oda">Orders</button>
                  <button type="button" className="dash-tab" role="tab" id="dash-tab-verified" aria-selected="false" aria-controls="dash-panel-verified" tabIndex={-1} data-dash-tab="verified" data-en="Verified" data-sw="Verified">Verified</button>
                </div>
                <div className="dash-panels" id="dash-panels">
                  <div className="dash-panel is-active" role="tabpanel" id="dash-panel-orders" aria-labelledby="dash-tab-orders" data-dash-panel="orders">
                    <p className="visually-hidden" data-en="Sample orders" data-sw="Oda za mfano">Sample orders</p>
                    <table className="dash-table">
                      <caption className="visually-hidden" data-en="Sample order list" data-sw="Orodha ya oda za mfano">Sample order list</caption>
                      <thead>
                        <tr>
                          <th scope="col" data-en="Order" data-sw="Oda">Order</th>
                          <th scope="col" data-en="Item" data-sw="Bidhaa">Item</th>
                          <th scope="col" data-en="Zone" data-sw="Eneo">Zone</th>
                          <th scope="col" data-en="Payment" data-sw="Malipo">Payment</th>
                          <th scope="col" data-en="Status" data-sw="Hali">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="dash-mono">#1042</td>
                          <td>Mtumba jacket</td>
                          <td>Milimani</td>
                          <td data-en="M-Pesa" data-sw="M-Pesa">M-Pesa</td>
                          <td><span className="dash-chip dash-chip--new" data-en="New" data-sw="Mpya">New</span></td>
                        </tr>
                        <tr>
                          <td className="dash-mono">#1038</td>
                          <td>Phone charger</td>
                          <td>CBD</td>
                          <td data-en="Pay on delivery" data-sw="Lipa ukifika">Pay on delivery</td>
                          <td><span className="dash-chip dash-chip--out" data-en="Out for delivery" data-sw="Imesafirishwa">Out for delivery</span></td>
                        </tr>
                        <tr>
                          <td className="dash-mono">#1031</td>
                          <td>Fresh veggies</td>
                          <td>Section 58</td>
                          <td data-en="M-Pesa" data-sw="M-Pesa">M-Pesa</td>
                          <td><span className="dash-chip dash-chip--done" data-en="Delivered" data-sw="Imewasili">Delivered</span></td>
                        </tr>
                      </tbody>
                    </table>
                    <ul className="dash-cards" role="list">
                      <li className="dash-card-row">
                        <span className="dash-card-k" data-en="Order" data-sw="Oda">Order</span>
                        <span className="dash-card-v dash-mono">#1042</span>
                        <span className="dash-card-k" data-en="Item" data-sw="Bidhaa">Item</span>
                        <span className="dash-card-v">Mtumba jacket</span>
                        <span className="dash-card-k" data-en="Zone" data-sw="Eneo">Zone</span>
                        <span className="dash-card-v">Milimani</span>
                        <span className="dash-card-k" data-en="Payment" data-sw="Malipo">Payment</span>
                        <span className="dash-card-v" data-en="M-Pesa" data-sw="M-Pesa">M-Pesa</span>
                        <span className="dash-chip dash-chip--new" data-en="New" data-sw="Mpya">New</span>
                      </li>
                      <li className="dash-card-row">
                        <span className="dash-card-k" data-en="Order" data-sw="Oda">Order</span>
                        <span className="dash-card-v dash-mono">#1038</span>
                        <span className="dash-card-k" data-en="Item" data-sw="Bidhaa">Item</span>
                        <span className="dash-card-v">Phone charger</span>
                        <span className="dash-card-k" data-en="Zone" data-sw="Eneo">Zone</span>
                        <span className="dash-card-v">CBD</span>
                        <span className="dash-card-k" data-en="Payment" data-sw="Malipo">Payment</span>
                        <span className="dash-card-v" data-en="Pay on delivery" data-sw="Lipa ukifika">Pay on delivery</span>
                        <span className="dash-chip dash-chip--out" data-en="Out for delivery" data-sw="Imesafirishwa">Out for delivery</span>
                      </li>
                      <li className="dash-card-row">
                        <span className="dash-card-k" data-en="Order" data-sw="Oda">Order</span>
                        <span className="dash-card-v dash-mono">#1031</span>
                        <span className="dash-card-k" data-en="Item" data-sw="Bidhaa">Item</span>
                        <span className="dash-card-v">Fresh veggies</span>
                        <span className="dash-card-k" data-en="Zone" data-sw="Eneo">Zone</span>
                        <span className="dash-card-v">Section 58</span>
                        <span className="dash-card-k" data-en="Payment" data-sw="Malipo">Payment</span>
                        <span className="dash-card-v" data-en="M-Pesa" data-sw="M-Pesa">M-Pesa</span>
                        <span className="dash-chip dash-chip--done" data-en="Delivered" data-sw="Imewasili">Delivered</span>
                      </li>
                    </ul>
                  </div>
                  <div className="dash-panel" role="tabpanel" id="dash-panel-products" aria-labelledby="dash-tab-products" data-dash-panel="products" hidden>
                    <p className="visually-hidden" data-en="Sample products" data-sw="Bidhaa za mfano">Sample products</p>
                    <table className="dash-table dash-table--products">
                      <caption className="visually-hidden" data-en="Sample product list" data-sw="Orodha ya bidhaa za mfano">Sample product list</caption>
                      <thead>
                        <tr>
                          <th scope="col" className="visually-hidden" data-en="Photo" data-sw="Picha">Photo</th>
                          <th scope="col" data-en="Product" data-sw="Bidhaa">Product</th>
                          <th scope="col" data-en="Price" data-sw="Bei">Price</th>
                          <th scope="col" data-en="Status" data-sw="Hali">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td><span className="dash-thumb dash-thumb--a" aria-hidden="true"></span></td>
                          <td>Mtumba jacket</td>
                          <td className="dash-mono">KES 850</td>
                          <td><span className="dash-chip dash-chip--live" data-en="Live" data-sw="Hai">Live</span></td>
                        </tr>
                        <tr>
                          <td><span className="dash-thumb dash-thumb--b" aria-hidden="true"></span></td>
                          <td>Phone charger</td>
                          <td className="dash-mono">KES 450</td>
                          <td><span className="dash-chip dash-chip--live" data-en="Live" data-sw="Hai">Live</span></td>
                        </tr>
                        <tr>
                          <td><span className="dash-thumb dash-thumb--c" aria-hidden="true"></span></td>
                          <td>Fresh veggies</td>
                          <td className="dash-mono">KES 120</td>
                          <td><span className="dash-chip dash-chip--draft" data-en="Draft" data-sw="Rasimu">Draft</span></td>
                        </tr>
                      </tbody>
                    </table>
                    <ul className="dash-cards dash-cards--products" role="list">
                      <li className="dash-card-row dash-card-row--product">
                        <span className="dash-thumb dash-thumb--a" aria-hidden="true"></span>
                        <span className="dash-card-v">Mtumba jacket</span>
                        <span className="dash-card-v dash-mono">KES 850</span>
                        <span className="dash-chip dash-chip--live" data-en="Live" data-sw="Hai">Live</span>
                      </li>
                      <li className="dash-card-row dash-card-row--product">
                        <span className="dash-thumb dash-thumb--b" aria-hidden="true"></span>
                        <span className="dash-card-v">Phone charger</span>
                        <span className="dash-card-v dash-mono">KES 450</span>
                        <span className="dash-chip dash-chip--live" data-en="Live" data-sw="Hai">Live</span>
                      </li>
                      <li className="dash-card-row dash-card-row--product">
                        <span className="dash-thumb dash-thumb--c" aria-hidden="true"></span>
                        <span className="dash-card-v">Fresh veggies</span>
                        <span className="dash-card-v dash-mono">KES 120</span>
                        <span className="dash-chip dash-chip--draft" data-en="Draft" data-sw="Rasimu">Draft</span>
                      </li>
                    </ul>
                  </div>
                  <div className="dash-panel" role="tabpanel" id="dash-panel-verified" aria-labelledby="dash-tab-verified" data-dash-panel="verified" hidden>
                    <div className="dash-verify-card">
                      <h3 className="dash-verify-title" data-en="Verification progress" data-sw="Hatua za uthibitisho">Verification progress</h3>
                      <ul className="dash-checklist" role="list">
                        <li className="dash-check is-done">
                          <span className="dash-check-icon" aria-hidden="true">✓</span>
                          <span data-en="ID check" data-sw="Ukaguzi wa kitambulisho">ID check</span>
                        </li>
                        <li className="dash-check is-pending">
                          <span className="dash-check-icon" aria-hidden="true">○</span>
                          <span data-en="Shop check" data-sw="Ukaguzi wa duka">Shop check</span>
                        </li>
                      </ul>
                      <p className="dash-verify-badge-row">
                        <span className="verified-badge verified-badge--locked" data-en="Verified" data-sw="Verified">Verified</span>
                        <span className="dash-lock-hint" aria-hidden="true">🔒</span>
                      </p>
                      <p className="mut dash-verify-note" data-en="M-Pesa upfront unlocks after approval." data-sw="M-Pesa mapema inafunguliwa baada ya idhini.">M-Pesa upfront unlocks after approval.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p className="dash-caption mut" data-en="Sample data — the live app may differ." data-sw="Data ya mfano — programu halisi inaweza kutofautiana.">Sample data — the live app may differ.</p>
          </div>
        </section>
    </>
  );
}
