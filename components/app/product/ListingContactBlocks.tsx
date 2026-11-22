"use client";

import { homeCopy } from "@/lib/nakuru/home-i18n";
import type { LandingLang } from "@/lib/nakuru/i18n";
import { toWhatsAppHref } from "@/lib/nakuru/whatsapp";

type WhatsAppProps = {
  lang: LandingLang;
  title: string;
  phone?: string;
};

export function ListingWhatsApp({ lang, title, phone }: WhatsAppProps) {
  const href = phone
    ? toWhatsAppHref(phone, `Hi, I am interested in ${title} on NakuruHub`)
    : null;

  return (
    <section className="card pd-card pd-wa" aria-labelledby="pd-wa-h">
      <h2 id="pd-wa-h" className="pd-about-title">
        {homeCopy("waSeller", lang)}
      </h2>
      {href ? (
        <a className="btn fl full" href={href} target="_blank" rel="noopener noreferrer">
          {homeCopy("waSeller", lang)}
        </a>
      ) : (
        <>
          <button type="button" className="btn fl full" disabled>
            {homeCopy("waSeller", lang)}
          </button>
          <p className="m">{homeCopy("waSellerMissing", lang)}</p>
        </>
      )}
    </section>
  );
}

