"use client";

import { useAuth } from "@/components/app/AppAuthProvider";
import { useNakuruApp } from "@/components/app/AppProvider";
import { apiFetch } from "@/lib/nakuru/api";
import { inquiryErrorMessage } from "@/lib/nakuru/inquiries";
import { kes } from "@/lib/nakuru/format";
import type { Listing } from "@/lib/nakuru/types";
import { requireAuth } from "@/lib/nakuru/require-auth";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useState, type FormEvent } from "react";

type Props = {
  listing: Listing;
  onClose: () => void;
};

export function ServiceInquiryModal({ listing, onClose }: Props) {
  const titleId = useId();
  const { user, ready } = useAuth();
  const { state, dispatch, toast } = useNakuruApp();
  const pathname = usePathname();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape" && !busy) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, busy]);

  const goSignIn = useCallback(() => {
    requireAuth(user, { tab: state.tab, path: pathname ?? undefined }, () => {
      onClose();
      dispatch({ type: "SET_TAB", tab: "acc" });
    });
  }, [dispatch, onClose, pathname, state.tab, user]);

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!user || busy) return;

    setBusy(true);
    try {
      await apiFetch<{ id: string }>("/api/service-inquiries", {
        method: "POST",
        body: JSON.stringify({
          productId: String(listing.id),
          message: message.trim(),
        }),
      });
      toast(`Quote request sent to ${listing.t}`);
      onClose();
    } catch (err) {
      toast(inquiryErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="inquiry-back"
      role="presentation"
      onClick={(ev) => {
        if (ev.target === ev.currentTarget && !busy) onClose();
      }}
    >
      <div
        className="card inquiry-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(ev) => ev.stopPropagation()}
      >
        <div className="row sp" style={{ marginBottom: 8 }}>
          <div className="t" id={titleId}>
            Request a quote
          </div>
          <button
            type="button"
            className="btn s o"
            disabled={busy}
            aria-label="Close"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="row" style={{ gap: 10, marginBottom: 10 }}>
          <div className="pim" style={{ width: 48, height: 48, fontSize: 28 }}>
            {listing.e}
          </div>
          <div>
            <div className="t">{listing.t}</div>
            <div className="m">{listing.s}</div>
            <div className="pr" style={{ marginTop: 4 }}>
              {kes(listing.p)}
            </div>
          </div>
        </div>

        {!ready ? (
          <div className="m">Loading…</div>
        ) : !user ? (
          <>
            <div className="warn">
              Sign in with your email code before requesting a quote. Vendors
              reply to the email on your account.
            </div>
            <button type="button" className="btn full" onClick={goSignIn}>
              Go to Account to sign in
            </button>
          </>
        ) : (
          <form onSubmit={(ev) => void submit(ev)}>
            <label htmlFor="inquiry-msg">Message (optional)</label>
            <textarea
              id="inquiry-msg"
              className="inquiry-msg"
              maxLength={500}
              rows={4}
              placeholder="Describe the job, location, or timing…"
              value={message}
              disabled={busy}
              onChange={(e) => setMessage(e.target.value)}
            />
            <div className="m" style={{ marginTop: 4 }}>
              {message.length}/500
            </div>
            <div className="row" style={{ marginTop: 12, gap: 8 }}>
              <button
                type="button"
                className="btn s o"
                disabled={busy}
                onClick={onClose}
              >
                Cancel
              </button>
              <button type="submit" className="btn full" disabled={busy}>
                {busy ? "Sending…" : "Send quote request"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}