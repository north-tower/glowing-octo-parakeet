const stroke = {
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const strokeBold = { ...stroke, strokeWidth: 2.25 };

export function SlideArtDelivery() {
  return (
    <svg
      className="sl-art sl-art--hero"
      width={168}
      height={120}
      viewBox="0 0 168 120"
      aria-hidden
    >
      <g opacity={0.95} {...strokeBold}>
        <ellipse cx="84" cy="98" rx="52" ry="8" fill="rgba(245,230,211,.25)" stroke="none" />
        <path
          d="M30 88h72v-6H46l-8-16h-12v22z"
          fill="rgba(79,195,187,.45)"
          stroke="none"
        />
        <path
          d="M52 46h44l10-22h26v22H52z"
          fill="rgba(236,95,123,.55)"
          stroke="none"
        />
        <rect x="64" y="52" width="22" height="16" rx="3" fill="#F5E6D3" stroke="none" />
        <circle cx="48" cy="92" r="9" fill="rgba(255,255,255,.2)" />
        <circle cx="94" cy="92" r="9" fill="rgba(255,255,255,.2)" />
        <circle cx="48" cy="92" r="9" />
        <circle cx="94" cy="92" r="9" />
        <circle cx="118" cy="38" r="8" fill="var(--fl)" stroke="none" />
        <path d="M118 30v16M110 38h16" stroke="#fff" strokeWidth={2} />
      </g>
    </svg>
  );
}

export function SlideArtProperty() {
  return (
    <svg
      className="sl-art"
      width={120}
      height={88}
      viewBox="0 0 120 88"
      aria-hidden
    >
      <g opacity={0.92} {...stroke}>
        <path
          d="M28 56V38l32-24 32 24v18H28z"
          fill="rgba(255,255,255,.1)"
        />
        <path d="M52 56V42h16v14" />
        <circle cx="78" cy="34" r="6" fill="rgba(236,95,123,.35)" stroke="none" />
        <path d="M78 28v12M72 34h12" />
      </g>
    </svg>
  );
}

export function SlideArtVerified() {
  return (
    <svg
      className="sl-art"
      width={120}
      height={88}
      viewBox="0 0 120 88"
      aria-hidden
    >
      <g opacity={0.95} {...stroke}>
        <path
          d="M60 72s36-16 36-44V22L60 12 24 22v6c0 28 36 44 36 44z"
          fill="rgba(79,195,187,.15)"
        />
        <path d="m44 42 10 10 22-22" strokeWidth={2.25} />
        <circle
          cx="86"
          cy="26"
          r="7"
          fill="var(--fl)"
          stroke="none"
          opacity={0.85}
        />
      </g>
    </svg>
  );
}