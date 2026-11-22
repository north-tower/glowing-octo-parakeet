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
      className="sl-art sl-art--hero sl-art--delivery"
      width={176}
      height={124}
      viewBox="0 0 176 124"
      aria-hidden
    >
      <g className="sl-art-idle" opacity={0.98} {...strokeBold}>
        <g className="sl-speed" opacity={0.45} stroke="#fff" strokeWidth={1.5}>
          <path d="M8 44h22" />
          <path d="M4 56h18" />
          <path d="M10 68h16" />
        </g>
        <ellipse
          className="sl-art-shadow"
          cx="92"
          cy="108"
          rx="56"
          ry="8"
          fill="rgba(245,230,211,.28)"
          stroke="none"
        />
        <g className="sl-van">
          <path
            d="M36 96h78v-8H54l-10-18H32v26z"
            fill="rgba(79,195,187,.55)"
            stroke="none"
          />
          <path
            d="M58 50h50l12-24h28v24H58z"
            fill="rgba(236,95,123,.72)"
            stroke="none"
          />
          <rect
            x="72"
            y="58"
            width="24"
            height="16"
            rx="3"
            fill="#F5E6D3"
            stroke="none"
          />
          <g className="sl-wheel">
            <circle cx="56" cy="100" r="10" fill="rgba(255,255,255,.22)" />
            <circle cx="56" cy="100" r="10" />
            <line x1="56" y1="92" x2="56" y2="108" />
            <line x1="48" y1="100" x2="64" y2="100" />
          </g>
          <g className="sl-wheel">
            <circle cx="106" cy="100" r="10" fill="rgba(255,255,255,.22)" />
            <circle cx="106" cy="100" r="10" />
            <line x1="106" y1="92" x2="106" y2="108" />
            <line x1="98" y1="100" x2="114" y2="100" />
          </g>
        </g>
        <g className="sl-plus">
          <circle cx="132" cy="36" r="10" fill="var(--fl)" stroke="none" />
          <path d="M132 27v18M123 36h18" stroke="#fff" strokeWidth={2.2} />
        </g>
      </g>
    </svg>
  );
}

export function SlideArtProperty() {
  return (
    <svg
      className="sl-art sl-art--property"
      width={132}
      height={100}
      viewBox="0 0 132 100"
      aria-hidden
    >
      <g className="sl-art-idle" opacity={0.95} {...stroke}>
        <ellipse
          className="sl-art-shadow"
          cx="62"
          cy="90"
          rx="36"
          ry="6"
          fill="rgba(255,255,255,.22)"
          stroke="none"
        />
        <g className="sl-house">
          <path
            d="M24 64V42L62 14l38 28v22H24z"
            fill="rgba(255,255,255,.16)"
          />
          <path d="M54 64V46h20v18" />
          <rect
            x="58"
            y="50"
            width="12"
            height="8"
            rx="1.5"
            fill="rgba(255,255,255,.28)"
            stroke="none"
          />
        </g>
        <g className="sl-plus">
          <circle cx="92" cy="32" r="8" fill="rgba(7,59,57,.28)" stroke="none" />
          <path d="M92 24v16M84 32h16" />
        </g>
      </g>
    </svg>
  );
}

export function SlideArtVerified() {
  return (
    <svg
      className="sl-art sl-art--verified"
      width={132}
      height={100}
      viewBox="0 0 132 100"
      aria-hidden
    >
      <g className="sl-art-idle" opacity={0.96} {...stroke}>
        <circle
          className="sl-ring"
          cx="66"
          cy="50"
          r="38"
          fill="none"
          stroke="rgba(79,195,187,.35)"
          strokeWidth="1.25"
        />
        <path
          className="sl-shield"
          d="M66 82s40-18 40-48V24L66 12 26 24v10c0 30 40 48 40 48z"
          fill="rgba(79,195,187,.18)"
        />
        <path className="sl-check" d="m48 48 12 12 26-26" strokeWidth={2.4} />
        <circle
          className="sl-plus"
          cx="96"
          cy="26"
          r="8"
          fill="var(--fl)"
          stroke="none"
          opacity={0.9}
        />
      </g>
    </svg>
  );
}
