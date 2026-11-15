"use client";

import Link from "next/link";




export function CategoriesSection() {
  return (
    <>
      <section id="categories" className="section-after-hero reveal-section">
          <div className="wrap">
            <p className="section-eyebrow"><span className="section-eyebrow-line" aria-hidden="true"></span><span data-en="01 Categories" data-sw="01 Kategoria">01 Categories</span></p>
            <h2 data-en="What you can sell" data-sw="Unachoweza kuuza">What you can sell</h2>
            <p className="section-intro mut" data-en="Pick one or more categories when you sign up. Each is reviewed separately." data-sw="Chagua aina moja au zaidi ukijisajili. Kila kategoria inakaguliwa.">Pick one or more categories when you sign up. Each is reviewed separately.</p>
            <div className="bento">
              <article className="bento-tile bento-shop">
                <div className="bento-shop-body">
                  <span className="icon-box icon-box-lg" aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6h15l-1.5 9h-12z"/><path d="M6 6l-1-3H2"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/></svg></span>
                  <h3 className="bento-title-lg" data-en="Shop" data-sw="Duka">Shop</h3>
                  <p className="bento-desc" data-en="Fashion, electronics, groceries, and more." data-sw="Mitindo, vifaa vya umeme, vyakula, na mengine.">Fashion, electronics, groceries, and more.</p>
                </div>
                <div className="bento-shop-list" aria-hidden="true">
                  <div className="bento-mini-row" aria-hidden="true">
                    <span className="bento-mini-thumb" aria-hidden="true"></span>
                    <span className="bento-mini-name">Mtumba jacket</span>
                    <span className="bento-mini-price">KES 850</span>
                    <span className="bento-mini-verified" aria-hidden="true">✓</span>
                  </div>
                  <div className="bento-mini-row" aria-hidden="true">
                    <span className="bento-mini-thumb bento-mini-thumb--b" aria-hidden="true"></span>
                    <span className="bento-mini-name">Phone charger</span>
                    <span className="bento-mini-price">KES 450</span>
                    <span className="bento-mini-verified" aria-hidden="true">✓</span>
                  </div>
                  <div className="bento-mini-row" aria-hidden="true">
                    <span className="bento-mini-thumb bento-mini-thumb--c" aria-hidden="true"></span>
                    <span className="bento-mini-name">Fresh veggies</span>
                    <span className="bento-mini-price">KES 120</span>
                    <span className="bento-mini-verified" aria-hidden="true">✓</span>
                  </div>
                </div>
                <ul className="bento-chips" role="list">
                  <li data-en="Fashion" data-sw="Mitindo">Fashion</li>
                  <li data-en="Electronics" data-sw="Vifaa vya umeme">Electronics</li>
                  <li data-en="Groceries" data-sw="Vyakula">Groceries</li>
                </ul>
              </article>
              <article className="bento-tile bento-property">
                <span className="icon-box" aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z"/></svg></span>
                <h3 data-en="Property" data-sw="Nyumba">Property</h3>
                <p className="bento-desc" data-en="Rentals, sales, and land in Nakuru." data-sw="Kukodisha, kuuza, na ardhi Nakuru.">Rentals, sales, and land in Nakuru.</p>
              </article>
              <article className="bento-tile bento-cars">
                <span className="icon-box" aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14c0-3 2.5-5 5.5-5h5c2.8 0 5 2 5.5 4.5"/><path d="M5 14h15v3H5z"/><circle cx="7.5" cy="17" r="1.5"/><circle cx="16.5" cy="17" r="1.5"/><path d="M9.5 9h2"/></svg></span>
                <h3 data-en="Cars" data-sw="Magari">Cars</h3>
                <p className="bento-desc" data-en="List vehicles with clear details." data-sw="Orodhesha magari kwa maelezo wazi.">List vehicles with clear details.</p>
              </article>
              <article className="bento-tile bento-services">
                <span className="icon-box" aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2 2-1.4-1.4 2-2z"/></svg></span>
                <h3 data-en="Services" data-sw="Huduma">Services</h3>
                <p className="bento-desc" data-en="Electricians, cleaners, plumbers, and more." data-sw="Mafundi umeme, wasafishaji, mafundi bomba, na mengine.">Electricians, cleaners, plumbers, and more.</p>
              </article>
            </div>
            <div className="bento-soon" role="note">
              <span className="soon-pill" data-en="Coming soon" data-sw="Inakuja hivi karibuni">Coming soon</span>
              <span className="bento-soon-item"><span className="icon-box icon-box-sm" aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M4 13h16v5H4z"/><path d="M6 13V9h12v4"/><path d="M7 9V7h10v2"/></svg></span> <span data-en="Stays" data-sw="Malazi">Stays</span> <span className="badge" data-en="Soon" data-sw="Inakuja">Soon</span></span>
              <span className="bento-soon-item"><span className="icon-box icon-box-sm" aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M5 15h14v2H5z"/><path d="M7 15l1.5-4h7L17 15"/><circle cx="8" cy="17" r="1.25"/><circle cx="16" cy="17" r="1.25"/><path d="M11 7h2v4h-2z"/></svg></span> <span data-en="Taxi" data-sw="Teksi">Taxi</span> <span className="badge" data-en="Soon" data-sw="Inakuja">Soon</span></span>
            </div>
          </div>
        </section>
    </>
  );
}
