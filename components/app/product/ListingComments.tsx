"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { CommentsSkeleton } from "@/components/app/loading/LoadingUi";
import { useAuth } from "@/components/app/AppAuthProvider";
import { ApiError, apiFetch } from "@/lib/nakuru/api";
import {
  commentInitials,
  formatCommentTime,
  type ListingCommentRow,
} from "@/lib/nakuru/comment-display";
import { homeCopy } from "@/lib/nakuru/home-i18n";
import type { LandingLang } from "@/lib/nakuru/i18n";
import { signInHref } from "@/lib/nakuru/post-sign-in-tab";
import Link from "next/link";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Props = {
  lang: LandingLang;
  productId: string;
};

function commentErrorCopy(code: string, lang: LandingLang): string {
  if (code === "unauthorized") return homeCopy("commentsSignIn", lang);
  if (code === "forbidden") return homeCopy("commentsForbidden", lang);
  if (code === "rate_limited") return homeCopy("commentsRateLimited", lang);
  if (code === "not_found") return homeCopy("commentsNotFound", lang);
  return homeCopy("commentsPostError", lang);
}

function isStaffRole(role: string | undefined): boolean {
  return role === "admin" || role === "support";
}

export function ListingComments({ lang, productId }: Props) {
  const { user, ready } = useAuth();
  const liveId = UUID_RE.test(productId) ? productId : null;

  const [comments, setComments] = useState<ListingCommentRow[]>([]);
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(liveId));
  const [posting, setPosting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const signedIn = ready && Boolean(user);
  const canPost = signedIn && user && !isStaffRole(user.role);
  const canModerate = signedIn && user && isStaffRole(user.role);

  const load = useCallback(async () => {
    if (!liveId) {
      setLoading(false);
      return;
    }
    try {
      const rows = await apiFetch<ListingCommentRow[]>(
        `/api/listings/${liveId}/comments`,
        { skipAuthRetry: true, credentials: "omit" },
      );
      setComments(rows);
      setStatus(null);
    } catch {
      setStatus(homeCopy("commentsLoadError", lang));
    } finally {
      setLoading(false);
    }
  }, [liveId, lang]);

  useEffect(() => {
    void load();
  }, [load]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!liveId || !canPost || posting) return;
    const text = body.trim();
    if (!text) return;
    setPosting(true);
    setStatus(null);
    try {
      const row = await apiFetch<ListingCommentRow>(
        `/api/listings/${liveId}/comments`,
        { method: "POST", body: JSON.stringify({ body: text }) },
      );
      setComments((prev) => [...prev, row]);
      setBody("");
    } catch (err) {
      const code = err instanceof ApiError ? err.body.error : "request_failed";
      setStatus(commentErrorCopy(code, lang));
    } finally {
      setPosting(false);
    }
  };

  const onDelete = async (id: string) => {
    if (deletingId) return;
    setDeletingId(id);
    setStatus(null);
    try {
      await apiFetch(`/api/comments/${id}`, { method: "DELETE" });
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      const code = err instanceof ApiError ? err.body.error : "request_failed";
      setStatus(commentErrorCopy(code, lang));
    } finally {
      setDeletingId(null);
    }
  };

  const title =
    comments.length > 0
      ? `${homeCopy("commentsTitle", lang)} (${comments.length})`
      : homeCopy("commentsTitle", lang);

  return (
    <section className="card pd-card pd-comments" aria-labelledby="pd-comments-h">
      <h2 id="pd-comments-h" className="pd-about-title">
        {title}
      </h2>

      {loading ? (
        <CommentsSkeleton />
      ) : comments.length === 0 ? (
        <p className="m">{homeCopy("commentsEmpty", lang)}</p>
      ) : (
        <ul className="pd-comment-list">
          {comments.map((c) => {
            const own = user?.id === c.authorId;
            const showDelete = own || canModerate;
            return (
              <li key={c.id} className="pd-comment">
                <span className="pd-comment-av" aria-hidden>
                  {commentInitials(c.authorHandle)}
                </span>
                <div className="pd-comment-main">
                <div className="pd-comment-meta">
                  <span className="pd-comment-handle">{c.authorHandle}</span>
                  <time dateTime={c.createdAt}>
                    {formatCommentTime(c.createdAt, lang)}
                  </time>
                </div>
                <p className="pd-comment-body">{c.body}</p>
                {showDelete ? (
                  <button
                    type="button"
                    className="pd-comment-del"
                    disabled={deletingId === c.id}
                    onClick={() => void onDelete(c.id)}
                  >
                    {homeCopy("commentsDelete", lang)}
                  </button>
                ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {!ready ? null : canPost ? (
        <form className="pd-comments-form" onSubmit={(e) => void onSubmit(e)}>
          <label className="sr-only" htmlFor="pd-comment">
            {homeCopy("commentsPlaceholder", lang)}
          </label>
          <textarea
            id="pd-comment"
            name="comment"
            rows={3}
            maxLength={500}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={homeCopy("commentsPlaceholder", lang)}
            disabled={!liveId || posting}
          />
          <button type="submit" className="btn" disabled={!liveId || posting}>
            {homeCopy("commentsSubmit", lang)}
          </button>
        </form>
      ) : canModerate ? null : (
        <Link
          className="pd-comments-signin-row"
          href={signInHref(`/app/p/${productId}`)}
        >
          {homeCopy("commentsSignIn", lang)}
        </Link>
      )}

      {status ? (
        <p className="m" role="status">
          {status}
        </p>
      ) : null}
    </section>
  );
}
