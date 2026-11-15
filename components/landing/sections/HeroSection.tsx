"use client";

import Link from "next/link";
import { useCheckoutDemo } from "@/components/landing/hooks/useCheckoutDemo";


export function HeroSection() {
  useCheckoutDemo();
  return (
    <>
      <section className="hero">
          <div className="hero-bg" aria-hidden="true">
            <div className="hero-bg-layers"></div>
            <div className="hero-bg-grain"></div>
          </div>
          <div className="wrap hero-grid">
            <div className="hero-copy">
              <span className="badge hero-badge" data-en="Nakuru only · Free to list" data-sw="Nakuru pekee · Bila malipo">Nakuru only · Free to list</span>
              <h1 data-en="Sell to Nakuru from one place." data-sw="Uza Nakuru kutoka mahali pamoja.">Sell to Nakuru from one place.</h1>
              <p className="lead" data-en="List shop, homes, cars, or services. Get approved, earn a Verified badge, and unlock M-Pesa upfront when you’re verified." data-sw="Orodhesha duka, nyumba, magari, au huduma. Thibitishwa, pata beji ya Verified, na ufungue M-Pesa mapema.">List shop, homes, cars, or services. Get approved, earn a Verified badge, and unlock M-Pesa upfront when you’re verified.</p>
              <div className="hero-cta" id="hero-cta">
                <Link className="btn fl" href="/app?start=vendor" data-en="Start selling" data-sw="Anza kuuza">Start selling</Link>
                <Link className="btn ghost hero-btn-outline" href="/app" data-en="Browse app" data-sw="Tazama programu">Browse app</Link>
              </div>
              <ul className="hero-proof" role="list">
                <li data-en="Free to join and list" data-sw="Bure kujiunga na kuorodhesha">Free to join and list</li>
                <li data-en="Verified = M-Pesa upfront" data-sw="Verified = M-Pesa mapema">Verified = M-Pesa upfront</li>
                <li data-en="Nakuru delivery zones" data-sw="Maeneo ya uwasilishaji Nakuru">Nakuru delivery zones</li>
              </ul>
            </div>
            <div className="hero-visual">
              <p className="visually-hidden" id="hero-checkout-label" data-en="Sample checkout on NakuruHub" data-sw="Mfano wa malipo kwenye NakuruHub">Sample checkout on NakuruHub</p>
              <div className="checkout-segment" role="tablist" aria-labelledby="hero-checkout-label" hidden>
                <button type="button" className="checkout-seg-btn" role="tab" id="checkout-tab-unverified" aria-selected="false" aria-controls="checkout-phone-panel" tabIndex={-1} data-checkout-tab="unverified" data-en="Unverified" data-sw="Bila uthibitisho">Unverified</button>
                <button type="button" className="checkout-seg-btn" role="tab" id="checkout-tab-verified" aria-selected="true" aria-controls="checkout-phone-panel" tabIndex={0} data-checkout-tab="verified" data-en="Verified" data-sw="Verified">Verified</button>
              </div>
              <p className="visually-hidden" id="checkout-live" aria-live="polite" aria-atomic="true"></p>
              <div className="phone-wrap">
                <span className="mock-float mock-float-mpesa" id="checkout-float-chip" data-en="M-Pesa received · KES 850" data-sw="M-Pesa received · KES 850">M-Pesa received · KES 850</span>
                <div className="phone-mock">
                  <div className="phone-frame">
                    <div className="phone-screen phone-screen--checkout" id="checkout-phone-panel" role="tabpanel" aria-labelledby="checkout-tab-verified">
                    <div className="mock-status"><span className="mock-time">9:41</span></div>
                    <div className="mock-header" data-en="Checkout" data-sw="Malipo">Checkout</div>
                    <div className="checkout-states" data-checkout-states>
                      <div className="checkout-state is-active" data-checkout-state="verified" aria-hidden="false">
                        <div className="checkout-state-inner">
                        <article className="mock-card mock-checkout-item">
                          <div className="mock-checkout-row">
                            <span className="mock-thumb mock-thumb--sm" aria-hidden="true">🛍️</span>
                            <div className="mock-checkout-copy">
                              <p className="mock-title mock-checkout-name">Mtumba jacket</p>
                              <p className="mock-price">KES 850</p>
                            </div>
                          </div>
                          <p className="mock-vendor-line"><span data-en="Sample shop · Milimani" data-sw="Duka la mfano · Milimani">Sample shop · Milimani</span> <span className="mock-verified-tick" aria-hidden="true">✓</span></p>
                        </article>
                        <div className="mock-payments" role="group" data-en-aria="Payment options" data-sw-aria="Chaguo za malipo" aria-label="Payment options">
                          <div className="mock-pay mock-pay--cod">
                            <span className="mock-pay-radio" aria-hidden="true"></span>
                            <span className="mock-pay-body">
                              <span className="mock-pay-title" data-en="Pay on delivery" data-sw="Lipa ukifika">Pay on delivery</span>
                              <span className="mock-pay-hint" data-en="Cash or M-Pesa to rider" data-sw="Fedha taslimu au M-Pesa kwa dereva">Cash or M-Pesa to rider</span>
                            </span>
                          </div>
                          <div className="mock-pay mock-pay--mpesa is-selected">
                            <span className="mock-pay-radio" aria-hidden="true"></span>
                            <span className="mock-pay-body">
                              <span className="mock-pay-title" data-en="M-Pesa now" data-sw="M-Pesa sasa">M-Pesa now</span>
                              <span className="mock-pay-hint" data-en="Pay before delivery" data-sw="Lipa kabla ya uwasilishaji">Pay before delivery</span>
                            </span>
                          </div>
                        </div>
                        <p className="mock-delivery" aria-hidden="true">
                          <svg className="mock-delivery-pin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>
                          <span data-en="Deliver to: Milimani" data-sw="Wasilishia: Milimani">Deliver to: Milimani</span>
                        </p>
                        <dl className="mock-summary" aria-hidden="true">
                          <div className="mock-summary-row">
                            <dt data-en="Item" data-sw="Bidhaa">Item</dt>
                            <dd>KES 850</dd>
                          </div>
                          <div className="mock-summary-row">
                            <dt data-en="Delivery" data-sw="Uwasilishaji">Delivery</dt>
                            <dd data-en="Set by zone" data-sw="Inawekwa kwa eneo">Set by zone</dd>
                          </div>
                        </dl>
                        <span className="mock-place-order" aria-hidden="true" data-en="Place order" data-sw="Weka oda">Place order</span>
                        </div>
                      </div>
                      <div className="checkout-state" data-checkout-state="unverified" aria-hidden="true" hidden>
                        <div className="checkout-state-inner">
                        <article className="mock-card mock-checkout-item">
                          <div className="mock-checkout-row">
                            <span className="mock-thumb mock-thumb--sm" aria-hidden="true">🛍️</span>
                            <div className="mock-checkout-copy">
                              <p className="mock-title mock-checkout-name">Mtumba jacket</p>
                              <p className="mock-price">KES 850</p>
                            </div>
                          </div>
                          <p className="mock-vendor-line mock-vendor-line--plain"><span data-en="Sample shop · Milimani" data-sw="Duka la mfano · Milimani">Sample shop · Milimani</span></p>
                        </article>
                        <div className="mock-payments" role="group" data-en-aria="Payment options" data-sw-aria="Chaguo za malipo" aria-label="Payment options">
                          <div className="mock-pay mock-pay--cod is-selected">
                            <span className="mock-pay-radio" aria-hidden="true"></span>
                            <span className="mock-pay-body">
                              <span className="mock-pay-title" data-en="Pay on delivery" data-sw="Lipa ukifika">Pay on delivery</span>
                              <span className="mock-pay-hint" data-en="Cash or M-Pesa to rider" data-sw="Fedha taslimu au M-Pesa kwa dereva">Cash or M-Pesa to rider</span>
                            </span>
                          </div>
                          <div className="mock-pay mock-pay--mpesa is-disabled" aria-disabled="true">
                            <span className="mock-pay-radio" aria-hidden="true"></span>
                            <span className="mock-pay-body">
                              <span className="mock-pay-title">
                                <span className="mock-pay-lock" aria-hidden="true">🔒</span>
                                <span data-en="M-Pesa now" data-sw="M-Pesa sasa">M-Pesa now</span>
                              </span>
                              <span className="mock-pay-hint mock-pay-hint--lock" data-en="Only from Verified vendors" data-sw="Kutoka kwa wauzaji Verified pekee">Only from Verified vendors</span>
                            </span>
                          </div>
                        </div>
                        <p className="mock-delivery" aria-hidden="true">
                          <svg className="mock-delivery-pin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>
                          <span data-en="Deliver to: Milimani" data-sw="Wasilishia: Milimani">Deliver to: Milimani</span>
                        </p>
                        <dl className="mock-summary" aria-hidden="true">
                          <div className="mock-summary-row">
                            <dt data-en="Item" data-sw="Bidhaa">Item</dt>
                            <dd>KES 850</dd>
                          </div>
                          <div className="mock-summary-row">
                            <dt data-en="Delivery" data-sw="Uwasilishaji">Delivery</dt>
                            <dd data-en="Set by zone" data-sw="Inawekwa kwa eneo">Set by zone</dd>
                          </div>
                        </dl>
                        <span className="mock-place-order" aria-hidden="true" data-en="Place order" data-sw="Weka oda">Place order</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              </div>
            </div>
          </div>
          <div className="zone-strip wrap">
            <p className="zone-label" data-en="We deliver to" data-sw="Tunafikisha">We deliver to</p>
            <div className="zone-marquee" aria-label="Delivery zones in Nakuru">
            <div className="zone-track">
              <span className="zone-chip">CBD</span>
              <span className="zone-chip">Milimani</span>
              <span className="zone-chip">Section 58</span>
              <span className="zone-chip">Lanet</span>
              <span className="zone-chip" aria-hidden="true">CBD</span>
              <span className="zone-chip" aria-hidden="true">Milimani</span>
              <span className="zone-chip" aria-hidden="true">Section 58</span>
              <span className="zone-chip" aria-hidden="true">Lanet</span>
            </div>
            </div>
          </div>
        </section>
    </>
  );
}
