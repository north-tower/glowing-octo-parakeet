"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/components/app/AppAuthProvider";
import { CardRowsSkeleton } from "@/components/app/loading/LoadingUi";
import { usePrimaryNav } from "@/components/app/usePrimaryNav";
import { ApiError, apiFetch } from "@/lib/nakuru/api";
import { homeCopy } from "@/lib/nakuru/home-i18n";
import {
  formatMessageTime,
  messageThreadInitials,
  type ListingMessageRow,
  type MessageThreadDetail,
  type MessageThreadSummary,
} from "@/lib/nakuru/listing-messages";
import { usePwaInstall } from "@/components/app/pwa/InstallProvider";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function threadErrorCopy(code: string, lang: "en" | "sw"): string {
  if (code === "unauthorized") return homeCopy("messagesSignIn", lang);
  if (code === "forbidden") return homeCopy("messagesForbidden", lang);
  if (code === "rate_limited") return homeCopy("messagesRateLimited", lang);
  if (code === "not_found") return homeCopy("messagesNotFound", lang);
  return homeCopy("messagesPostError", lang);
}

export function MessagesView() {
  const { lang } = usePwaInstall();
  const { user, ready } = useAuth();
  const { goTab } = usePrimaryNav();
  const searchParams = useSearchParams();
  const threadParam = searchParams.get("thread");

  const [threads, setThreads] = useState<MessageThreadSummary[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [detail, setDetail] = useState<MessageThreadDetail | null>(null);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingThread, setLoadingThread] = useState(false);
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const loadThreads = useCallback(async () => {
    if (!user) return;
    setLoadingList(true);
    try {
      const data = await apiFetch<{ threads: MessageThreadSummary[] }>(
        "/api/message-threads/mine",
      );
      setThreads(data.threads ?? []);
      setStatus(null);
    } catch {
      setStatus(homeCopy("messagesLoadError", lang));
    } finally {
      setLoadingList(false);
    }
  }, [user, lang]);

  const loadThread = useCallback(
    async (id: string) => {
      setLoadingThread(true);
      try {
        const row = await apiFetch<MessageThreadDetail>(
          `/api/message-threads/${id}`,
        );
        setDetail(row);
        setActiveId(id);
        setStatus(null);
      } catch (err) {
        const code = err instanceof ApiError ? err.body.error : "request_failed";
        setStatus(threadErrorCopy(code, lang));
        setDetail(null);
        setActiveId(null);
      } finally {
        setLoadingThread(false);
      }
    },
    [lang],
  );

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      setThreads([]);
      setDetail(null);
      setActiveId(null);
      return;
    }
    void loadThreads();
  }, [ready, user, loadThreads]);

  useEffect(() => {
    if (!ready || !user) return;
    if (threadParam && UUID_RE.test(threadParam)) {
      void loadThread(threadParam);
    }
  }, [ready, user, threadParam, loadThread]);

  const openThread = (id: string) => {
    void loadThread(id);
  };

  const closeThread = () => {
    setActiveId(null);
    setDetail(null);
    setBody("");
    setStatus(null);
  };

  const onSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!activeId || posting) return;
    const text = body.trim();
    if (!text) return;
    setPosting(true);
    setStatus(null);
    try {
      const row = await apiFetch<ListingMessageRow>(
        `/api/message-threads/${activeId}/messages`,
        { method: "POST", body: JSON.stringify({ body: text }) },
      );
      setDetail((prev) =>
        prev
          ? { ...prev, messages: [...prev.messages, row] }
          : prev,
      );
      setBody("");
      void loadThreads();
    } catch (err) {
      const code = err instanceof ApiError ? err.body.error : "request_failed";
      setStatus(threadErrorCopy(code, lang));
    } finally {
      setPosting(false);
    }
  };

  if (!ready) {
    return <CardRowsSkeleton />;
  }

  if (!user) {
    return (
      <>
        <h2 style={{ marginTop: 0 }}>{homeCopy("navMessage", lang)}</h2>
        <MessagesEmptyCard lang={lang} onSignIn={() => goTab("acc")} />
      </>
    );
  }

  if (activeId !== null && detail) {
    return (
      <div className="msg-thread">
        <button type="button" className="btn s o" onClick={closeThread}>
          ‹ {homeCopy("navMessage", lang)}
        </button>
        <h2 style={{ marginTop: 8 }}>{detail.vendorName}</h2>
        <p className="m">
          <Link href={`/app/p/${detail.productId}`}>
            {detail.productTitle}
          </Link>
        </p>
        <div className="msg-bubbles">
          {loadingThread ? (
            <CardRowsSkeleton count={2} />
          ) : (
            detail.messages.map((m) => (
              <div
                key={m.id}
                className={m.mine ? "msg-bubble msg-bubble--mine" : "msg-bubble"}
              >
                {!m.mine ? (
                  <span className="msg-bubble-handle">{m.senderHandle}</span>
                ) : null}
                <p>{m.body}</p>
                <time dateTime={m.createdAt}>
                  {formatMessageTime(m.createdAt, lang)}
                </time>
              </div>
            ))
          )}
        </div>
        <form className="msg-compose" onSubmit={(e) => void onSend(e)}>
          <label className="sr-only" htmlFor="msg-reply">
            {homeCopy("messagesPlaceholder", lang)}
          </label>
          <textarea
            id="msg-reply"
            rows={2}
            maxLength={500}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={homeCopy("messagesPlaceholder", lang)}
            disabled={posting}
          />
          <button type="submit" className="btn" disabled={posting}>
            {homeCopy("messagesSend", lang)}
          </button>
        </form>
        {status ? (
          <p className="m" role="status">
            {status}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <>
      <h2 style={{ marginTop: 0 }}>{homeCopy("navMessage", lang)}</h2>
      {loadingList ? (
        <CardRowsSkeleton />
      ) : threads.length === 0 ? (
        <MessagesEmptyCard lang={lang} />
      ) : (
        threads.map((t) => (
          <div
            key={t.id}
            className="card li"
            role="button"
            tabIndex={0}
            onClick={() => openThread(t.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") openThread(t.id);
            }}
          >
            <div className="av">{messageThreadInitials(t.peerLabel)}</div>
            <div style={{ flex: 1 }}>
              <div className="t">{t.peerLabel}</div>
              <div className="m">{t.productTitle}</div>
              {t.lastMessage ? (
                <div className="m msg-preview">{t.lastMessage}</div>
              ) : null}
            </div>
            <span className="m">{formatMessageTime(t.lastMessageAt, lang)}</span>
          </div>
        ))
      )}
      {status ? (
        <p className="m" role="status">
          {status}
        </p>
      ) : null}
    </>
  );
}

function MessagesEmptyCard({
  lang,
  onSignIn,
}: {
  lang: "en" | "sw";
  onSignIn?: () => void;
}) {
  return (
    <div className="card" style={{ marginTop: 12 }}>
      <p className="m">{homeCopy("messagesEmpty", lang)}</p>
      {onSignIn ? (
        <button type="button" className="btn o" style={{ marginTop: 8 }} onClick={onSignIn}>
          {homeCopy("messagesSignIn", lang)}
        </button>
      ) : null}
    </div>
  );
}