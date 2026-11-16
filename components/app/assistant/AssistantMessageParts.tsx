"use client";

import Link from "next/link";
import { CartOrderCard } from "@/components/app/cart/CartOrderCard";
import { useNakuruApp } from "@/components/app/AppProvider";
import { itemById } from "@/lib/nakuru/data/items";
import { kes } from "@/lib/nakuru/format";
import { homeCopy } from "@/lib/nakuru/home-i18n";
import type { LandingLang } from "@/lib/nakuru/i18n";
import type { AssistantAction, AssistantPart } from "@/lib/assistant/types";
import { IconCheck, IconWallet } from "@/components/app/icons/LineIcons";

type Props = {
  parts: AssistantPart[];
  lang: LandingLang;
  onQuickReply: (id: string) => void;
  onRunAction: (
    action: AssistantAction,
    requiresConfirm?: boolean,
    label?: string,
  ) => void;
  pendingConfirm?: AssistantAction | null;
  onConfirmPending?: () => void;
  /** When set, quick-reply parts are omitted (rendered outside the bubble). */
  omitQuickReplies?: boolean;
  /** Muted quick replies stay visible but non-interactive. */
  quickRepliesMuted?: boolean;
};

function CompactProduct({
  id,
  lang,
}: {
  id: string | number;
  lang: LandingLang;
}) {
  const item = itemById(id);
  if (!item) return null;
  return (
    <Link href={`/app/p/${id}`} className="assistant-product-card">
      <div className="assistant-product-card__body">
        <p className="assistant-product-card__title">{item.t}</p>
        <p className="m">{item.s}</p>
        <p className="assistant-product-card__price">{kes(item.p)}</p>
        {item.v ? (
          <span className="assistant-product-card__pill">
            <IconCheck size={14} />
            {homeCopy("verifiedPill", lang)}
          </span>
        ) : (
          <span className="assistant-product-card__pill assistant-product-card__pill--muted">
            <IconWallet size={14} />
            {homeCopy("payOnDelivery", lang)}
          </span>
        )}
      </div>
    </Link>
  );
}

export function AssistantMessageParts({
  parts,
  lang,
  onQuickReply,
  onRunAction,
  pendingConfirm,
  onConfirmPending,
  omitQuickReplies = false,
  quickRepliesMuted = false,
}: Props) {
  const { state, dispatch, toast } = useNakuruApp();

  return (
    <>
      {parts.map((part, i) => {
        if (part.type === "text") {
          return (
            <p key={`t-${i}`} className="assistant-msg-text">
              {part.text}
            </p>
          );
        }
        if (part.type === "quickReplies") {
          if (omitQuickReplies) return null;
          return (
            <div key={`qr-${i}`} className="assistant-quick-replies" role="group">
              {part.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`assistant-quick-reply${quickRepliesMuted ? " assistant-quick-reply--muted" : ""}`}
                  disabled={quickRepliesMuted}
                  aria-disabled={quickRepliesMuted || undefined}
                  onClick={() => onQuickReply(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          );
        }
        if (part.type === "productCards") {
          return (
            <div key={`pc-${i}`} className="assistant-product-list">
              {part.items.map((p) => (
                <CompactProduct key={String(p.id)} id={p.id} lang={lang} />
              ))}
            </div>
          );
        }
        if (part.type === "orderCard") {
          const order = state.orders.find(
            (o) => String(o.id) === String(part.orderId),
          );
          if (!order) return null;
          return (
            <div key={`oc-${i}`} className="assistant-order-wrap">
              <CartOrderCard
                lang={lang}
                order={order}
                dispatch={dispatch}
                onTrack={() => toast(homeCopy("cartSegmentOrders", lang))}
                onToast={toast}
              />
            </div>
          );
        }
        if (part.type === "notice") {
          return (
            <p
              key={`n-${i}`}
              className={`assistant-notice assistant-notice--${part.tone}`}
              role="note"
            >
              {part.text}
            </p>
          );
        }
        if (part.type === "action") {
          const isPending =
            pendingConfirm &&
            JSON.stringify(pendingConfirm) === JSON.stringify(part.action);
          if (part.requiresConfirm && isPending) {
            return (
              <div key={`a-${i}`} className="assistant-confirm-row">
                <button
                  type="button"
                  className="assistant-quick-reply assistant-quick-reply--confirm"
                  onClick={() => onConfirmPending?.()}
                >
                  {part.label ?? (lang === "sw" ? "Thibitisha" : "Confirm")}
                </button>
              </div>
            );
          }
          if (part.requiresConfirm && !isPending) {
            return (
              <button
                key={`a-${i}`}
                type="button"
                className="assistant-quick-reply"
                onClick={() => onRunAction(part.action, true, part.label)}
              >
                {part.label ?? part.action.type}
              </button>
            );
          }
          return (
            <button
              key={`a-${i}`}
              type="button"
              className="assistant-quick-reply"
              onClick={() => onRunAction(part.action, false, part.label)}
            >
              {part.label ?? part.action.type}
            </button>
          );
        }
        return null;
      })}
    </>
  );
}