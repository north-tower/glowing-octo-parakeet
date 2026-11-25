import { AssistantEntryChip } from "@/components/app/assistant/AssistantEntryChip";
import { homeCopy } from "@/lib/nakuru/home-i18n";
import type { LandingLang } from "@/lib/nakuru/i18n";

type Props = {
  lang: LandingLang;
  callHref: string | null;
  whatsappHref: string | null;
  onMessage: () => void;
  onAsk: () => void;
};

export function ListingQuickActions({
  lang,
  callHref,
  whatsappHref,
  onMessage,
  onAsk,
}: Props) {
  return (
    <div className="pd-actions">
      <div className="pd-actions-row">
        {callHref ? (
          <a className="pd-action-chip" href={callHref}>
            {homeCopy("productCall", lang)}
          </a>
        ) : null}
        {whatsappHref ? (
          <a
            className="pd-action-chip"
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            {homeCopy("waSeller", lang)}
          </a>
        ) : null}
        <button type="button" className="pd-action-chip" onClick={onMessage}>
          {homeCopy("productMessageSeller", lang)}
        </button>
      </div>
      <div className="assistant-entry-row">
        <AssistantEntryChip
          label={homeCopy("assistantEntryProduct", lang)}
          onClick={onAsk}
        />
      </div>
    </div>
  );
}
