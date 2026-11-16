const stroke = {
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconMapPin({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke}>
      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export function IconChevronDown({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function IconSearch({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export function IconCamera({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke}>
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  );
}

export function IconShieldCheck({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function IconWallet({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke}>
      <path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2" />
      <path d="M3 10h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8z" />
      <path d="M17 14h.01" />
    </svg>
  );
}

export function IconGrid({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

export function IconTarget({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

export function IconMessageQuote({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke}>
      <path d="M7 11h4a2 2 0 0 0 2-2V6.5A2.5 2.5 0 0 0 10.5 4H6.5A2.5 2.5 0 0 0 4 6.5V14a2 2 0 0 0 2 2h1v3l3-3" />
      <path d="M17 11h4a2 2 0 0 0 2-2V6.5A2.5 2.5 0 0 0 20.5 4h-4A2.5 2.5 0 0 0 14 6.5V14a2 2 0 0 0 2 2h1v3l3-3" />
    </svg>
  );
}

export function IconFlamingo({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke}>
      <path d="M5 20c2-6 5-10 10-12 1 4-1 8-4 10" />
      <path d="M15 8c3 1 5 4 4 7" />
      <path d="M8 18h2M6 16h1" />
    </svg>
  );
}

export function IconStore({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke}>
      <path d="m2 7 2-3h16l2 3" />
      <path d="M4 7v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7" />
      <path d="M10 7v14M14 7v14M2 11h20" />
    </svg>
  );
}

export function IconSparkle({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" />
    </svg>
  );
}

export function IconCheck({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke}>
      <path d="m20 6-11 11-5-5" />
    </svg>
  );
}

export function IconSmartphone({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke}>
      <rect x="6" y="2" width="12" height="20" rx="2.5" />
      <path d="M10 18h4" />
    </svg>
  );
}

export function IconTv({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke}>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 18v2" />
    </svg>
  );
}

export function IconCookingPot({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke}>
      <path d="M3 11h18v2a7 7 0 0 1-7 7H10a7 7 0 0 1-7-7v-2z" />
      <path d="M6 11V8M10 11V7M14 11V8M18 11V7" />
    </svg>
  );
}

export function IconHome({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke}>
      <path d="M4 11.5 12 5l8 6.5V20a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1z" />
    </svg>
  );
}

export function IconCar({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke}>
      <path d="M4 14c0-2.8 2.2-5 5.5-5h5c2.5 0 4.5 1.8 5.2 4.2" />
      <path d="M5 14h15v3H5z" />
      <circle cx="7.5" cy="17" r="1.25" />
      <circle cx="16.5" cy="17" r="1.25" />
      <path d="M9.5 9h2" />
    </svg>
  );
}

export function IconBolt({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke}>
      <path d="M13 2 5 14h6l-1 8 9-12h-6z" />
    </svg>
  );
}

export function IconShirt({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke}>
      <path d="M8 4 4 7v2l3 1v10h10V10l3-1V7l-4-3" />
      <path d="M8 4h8M12 4v3" />
    </svg>
  );
}

export function IconMountain({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke}>
      <path d="m8 21 4-9 4 9" />
      <path d="M2 21h20M6 21l3-6 3 4 3-7 3 9" />
    </svg>
  );
}

export function IconShoe({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke}>
      <path d="M3 15c2-2 5-3 8-3h4c2 0 4 1 6 3v2H3z" />
      <path d="M6 14V10a2 2 0 0 1 2-2h2" />
    </svg>
  );
}

export function IconSalad({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke}>
      <path d="M4 11c2-4 6-6 8-6s6 2 8 6" />
      <path d="M6 11h12v2a6 6 0 0 1-6 6H12a6 6 0 0 1-6-6z" />
    </svg>
  );
}

export function IconWatch({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke}>
      <rect x="7" y="6" width="10" height="12" rx="3" />
      <path d="M9 6V4M15 6V4M9 18v2M15 18v2" />
      <path d="M12 10v4l2.5 1.5" />
    </svg>
  );
}

export function IconWrench({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke}>
      <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4z" />
    </svg>
  );
}

export function IconShoppingCart({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke}>
      <circle cx="9" cy="20" r="1.25" />
      <circle cx="17" cy="20" r="1.25" />
      <path d="M3 4h2l2.2 11.2a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.6L21 7H7" />
    </svg>
  );
}

export function IconMessageCircle({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke}>
      <path d="M7.5 19 4 20v-4.5A9 9 0 1 1 20 11.5V19l-3.5-1" />
    </svg>
  );
}

export function IconUser({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
    </svg>
  );
}

export function IconSprayBottle({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke}>
      <path d="M9 4h3v3H9z" />
      <path d="M10.5 7v2.5M12 7v2.5M13.5 7v2.5" />
      <path d="M8 9.5h7l-1 11a2 2 0 0 1-2 1.8H11a2 2 0 0 1-2-1.8z" />
      <path d="M15.5 5.5 18 4" />
    </svg>
  );
}

export function IconLandPlot({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke}>
      <path d="M4 18 12 6l8 12" />
      <path d="M4 18h16" />
      <path d="M12 6v4" />
      <circle cx="12" cy="11" r="2.25" />
    </svg>
  );
}

export function IconX({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke}>
      <path d="m18 6-12 12M6 6l12 12" />
    </svg>
  );
}