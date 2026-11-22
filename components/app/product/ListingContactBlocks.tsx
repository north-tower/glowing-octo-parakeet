"use client";

import { FormEvent, useState } from "react";
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

type CommentsProps = { lang: LandingLang };

export function ListingCommentsShell({ lang }: CommentsProps) {
  const [soon, setSoon] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSoon(true);
  };

  return (
    <section className="card pd-card pd-comments" aria-labelledby="pd-comments-h">
      <h2 id="pd-comments-h" className="pd-about-title">
        {homeCopy("commentsTitle", lang)}
      </h2>
      <p className="m">{homeCopy("commentsEmpty", lang)}</p>
      <form className="pd-comments-form" onSubmit={onSubmit}>
        <label className="sr-only" htmlFor="pd-comment">
          {homeCopy("commentsPlaceholder", lang)}
        </label>
        <textarea
          id="pd-comment"
          name="comment"
          rows={3}
          placeholder={homeCopy("commentsPlaceholder", lang)}
        />
        <button type="submit" className="btn">
          {homeCopy("commentsSubmit", lang)}
        </button>
      </form>
      {soon ? (
        <p className="m" role="status">
          {homeCopy("commentsSoon", lang)}
        </p>
      ) : null}
    </section>
  );
}
