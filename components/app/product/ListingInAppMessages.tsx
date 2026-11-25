"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/app/AppAuthProvider";
import { ApiError, apiFetch } from "@/lib/nakuru/api";
import { homeCopy } from "@/lib/nakuru/home-i18n";
import type { LandingLang } from "@/lib/nakuru/i18n";
import { requireAuth } from "@/lib/nakuru/require-auth";
import { signInHref } from "@/lib/nakuru/post-sign-in-tab";
import { usePrimaryNav } from "@/components/app/usePrimaryNav";
import { useNakuruApp } from "@/components/app/AppProvider";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Props = {
  lang: LandingLang;
  productId: string;
  vendorName: string;
  vendorInitials: string;
  verified: boolean;
};

function messageErrorCopy(code: string, lang: LandingLang): string {
  if (code === "unauthorized") return homeCopy("messagesSignIn", lang);
  if (code === "forbidden") return homeCopy("messagesForbidden", lang);
  if (code === "rate_limited") return homeCopy("messagesRateLimited", lang);
  if (code === "not_found") return homeCopy("messagesNotFound", lang);
  if (code === "own_product") return homeCopy("messagesOwnProduct", lang);
  return homeCopy("messagesPostError", lang);
}

export function ListingInAppMessages({
  lang,
  productId,
  vendorName,
  vendorInitials: _vendorInitials,
  verified,
}: Props) {
  const { user, ready } = useAuth();
  const { goTab } = usePrimaryNav();
  const { toast } = useNakuruApp();
  const router = useRouter();
  const liveId = UUID_RE.test(productId) ? productId : null;

  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const signedIn = ready && Boolean(user);

  const openMessagesTab = (threadId: string) => {
    dispatchTabMsg(threadId, router);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!liveId || posting) return;
    const text = body.trim();
    if (!text) return;

    if (
      !requireAuth(user, { tab: "msg", path: `/app/p/${productId}` }, () =>
        goTab("acc"),
      )
    ) {
      return;
    }

    setPosting(true);
    setStatus(null);
    try {
      const result = await apiFetch<{ threadId: string }>(
        `/api/listings/${liveId}/message-thread`,
        { method: "POST", body: JSON.stringify({ body: text }) },
      );
      setBody("");
      toast(homeCopy("messagesSent", lang));
      openMessagesTab(result.threadId);
    } catch (err) {
      const code = err instanceof ApiError ? err.body.error : "request_failed";
      setStatus(messageErrorCopy(code, lang));
    } finally {
      setPosting(false);
    }
  };

  const onOpenInbox = () => {
    if (
      !requireAuth(user, { tab: "msg", path: `/app/p/${productId}` }, () =>
        goTab("acc"),
      )
    ) {
      return;
    }
    dispatchTabMsg(null, router);
  };

  return (
    <section
      className="card pd-card pd-seller"
      aria-labelledby="pd-msg-h"
    >
      <h2 id="pd-msg-h" className="pd-about-title">
        {homeCopy("productMessageSeller", lang)}
      </h2>
      <p className="m">
        {vendorName}
        {verified ? " ✓" : ""} · {homeCopy("messagesHint", lang)}
      </p>

      {!ready ? null : signedIn ? (
        <form className="pd-msg-form" onSubmit={(e) => void onSubmit(e)}>
          <label className="sr-only" htmlFor="pd-msg-body">
            {homeCopy("messagesPlaceholder", lang)}
          </label>
          <textarea
            id="pd-msg-body"
            rows={3}
            maxLength={500}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={homeCopy("messagesPlaceholder", lang)}
            disabled={!liveId || posting}
          />
          <div className="pd-msg-actions">
            <button
              type="submit"
              className="btn full pd-seller-msg"
              disabled={!liveId || posting}
            >
              {homeCopy("productMessageSeller", lang)}
            </button>
            <button
              type="button"
              className="btn s o"
              onClick={onOpenInbox}
            >
              {homeCopy("messagesOpenInbox", lang)}
            </button>
          </div>
        </form>
      ) : (
        <Link
          className="pd-comments-signin-row"
          href={signInHref(`/app/p/${productId}`)}
        >
          {homeCopy("messagesSignIn", lang)}
        </Link>
      )}

      {status ? (
        <p className="m" role="status">
          {status}
        </p>
      ) : null}

      {!liveId ? (
        <p className="m">
          <Link href="/app?tab=msg">{homeCopy("messagesOpenInbox", lang)}</Link>
        </p>
      ) : null}
    </section>
  );
}

function dispatchTabMsg(threadId: string | null, router: ReturnType<typeof useRouter>) {
  const q = threadId ? `tab=msg&thread=${threadId}` : "tab=msg";
  router.push(`/app?${q}`);
}