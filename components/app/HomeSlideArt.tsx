const stroke = {
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function SlideArtDelivery() {
  return (
    <svg
      className="sl-art"
      width={120}
      height={88}
      viewBox="0 0 120 88"
      aria-hidden
    >
      <g opacity={0.92} {...stroke}>
        <path d="M18 58h52l8-18h24v18H18z" fill="rgba(255,255,255,.12)" />
        <circle cx="32" cy="62" r="7" />
        <circle cx="78" cy="62" r="7" />
        <path d="M8 44h28l6 14H18" />
        <path d="M44 30h20l10 10" />
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