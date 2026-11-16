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

export function IconChevronLeft({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke}>
      <path d="m15 18-6-6 6-6" />
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

export function IconStore({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke}>
      <path d="m2 7 2-3h16l2 3" />
      <path d="M4 7v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7" />
      <path d="M10 7v14M14 7v14M2 11h20" />
    </svg>
  );
}

export function IconBookOpen({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke}>
      <path d="M12 7v14" />
      <path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v18H8.5A3.5 3.5 0 0 1 5 16.5v-11Z" />
      <path d="M19 5.5A3.5 3.5 0 0 0 15.5 2H12v18h3.5A3.5 3.5 0 0 0 19 16.5v-11Z" />
    </svg>
  );
}

export function IconArrowUp({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke}>
      <path d="m12 19V5" />
      <path d="m5 12 7-7 7 7" />
    </svg>
  );
}

export function IconSquare({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke}>
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}

export function IconEllipsis({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke}>
      <circle cx="5" cy="12" r="1.25" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.25" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12" r="1.25" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconSparkle({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke}>
      <path d="m12 3 2.2 4.46 4.98.72-3.6 3.51.85 4.96L12 14.77l-4.45 2.18.85-4.96-3.6-3.51 4.98-.72z" />
      <path d="M19 4h1M20.5 5.5V4.5" />
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
      <path d="M8 9V7.5a4 4 0 0 1 8 0V9" />
      <path d="M6 9h12l-1.1 11H7.1L6 9z" />
      <path d="M9 13h6" />
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

export function IconTools({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke}>
      <path d="M14.5 6.4a3.5 3.5 0 0 0-4.6 4.6L4 17v2h2l5.4-5.4a3.5 3.5 0 0 0 4.6-4.6z" />
      <path d="m16 3 5 5M17.5 4.5 9 13" />
    </svg>
  );
}

export function IconShoppingBag({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke}>
      <path d="M8 8V6.2a4 4 0 0 1 8 0V8" />
      <path d="M6 8h12l-1.15 13H7.15L6 8z" />
    </svg>
  );
}

export function IconBed({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke}>
      <path d="M2 5v14" />
      <path d="M2 10h20v6H2z" />
      <path d="M2 16h20" />
      <path d="M6 10v6" />
    </svg>
  );
}

export function IconTaxi({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke}>
      <path d="M5 15h14v2H5z" />
      <path d="M7 15l1.5-4h7L17 15" />
      <circle cx="8" cy="17" r="1.25" />
      <circle cx="16" cy="17" r="1.25" />
      <path d="M11 7h2v4h-2z" />
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
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z" />
    </svg>
  );
}

export function IconUser({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="9.5" r="2.75" />
      <path d="M7 18.5a5 5 0 0 1 10 0" />
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

export function IconShare2({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke}>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.59 13.51 6.82 3.98M15.41 6.51l-6.82 3.98" />
    </svg>
  );
}

/** @deprecated Use IconShare2 for product share affordance */
export function IconShare({ size = 24 }: { size?: number }) {
  return <IconShare2 size={size} />;
}

export function IconChevronRight({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export function IconPromoDelivery({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke}>
      <path d="M10 17h4" />
      <path d="M3 7h11v8H3z" />
      <path d="M14 9h3l3 3v3h-6V9z" />
      <circle cx="7.5" cy="17.5" r="1.75" />
      <circle cx="17.5" cy="17.5" r="1.75" />
    </svg>
  );
}

export function IconPlus({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconMinus({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke}>
      <path d="M5 12h14" />
    </svg>
  );
}

export function IconTrash2({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke}>
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

export function IconCopy({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke}>
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

export function IconReceipt({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke}>
      <path d="M4 3h16v18l-3-2-3 2-3-2-3 2-3-2-1 2V3z" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  );
}

export function IconLock({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke}>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

export function IconAlertCircle({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4M12 16h.01" />
    </svg>
  );
}

export function IconGlobe({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke}>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

export function IconHeart({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke}>
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

export function IconLifeBuoy({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="4" />
      <path d="m4.93 4.93 3.54 3.54M14.53 14.53l3.54 3.54M14.53 9.47l3.54-3.54M4.93 19.07l3.54-3.54" />
    </svg>
  );
}

export function IconClock({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

export function IconLogOut({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5M21 12H9" />
    </svg>
  );
}

export function IconClipboard({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...stroke}>
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    </svg>
  );
}