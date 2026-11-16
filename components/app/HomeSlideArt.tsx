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
      className="sl-art"
      width={120}
      height={88}
      viewBox="0 0 120 88"
      aria-hidden
    >
      <g opacity={0.9} {...strokeBold}>
        <ellipse cx="58" cy="68" rx="34" ry="6" fill="rgba(255,255,255,.08)" stroke="none" />
        <path d="M26 62h46v-4H38l-4-10h-8v14z" fill="rgba(255,255,255,.12)" />
        <circle cx="34" cy="66" r="6.5" />
        <circle cx="62" cy="66" r="6.5" />
        <path d="M52 30c0-2 2-4 5-4h8" />
        <circle cx="56" cy="24" r="5" />
        <path d="M44 48h20l6-14h14v14H44z" />
        <rect x="48" y="36" width="12" height="10" rx="1.5" fill="rgba(255,255,255,.14)" />
        <path d="M50 38h8v2M50 41h6" strokeWidth={1.75} />
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