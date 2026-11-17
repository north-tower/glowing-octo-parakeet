type Props = {
  /** Visual size in px. */
  size?: number;
  className?: string;
};

/** NakuruHub app icon mark (matches PWA install icon). */
export function BrandLogoMark({ size = 22, className = "logo-mark" }: Props) {
  const radius = Math.round(size * 0.22);
  return (
    // eslint-disable-next-line @next/next/no-img-element -- tiny brand raster; matches PWA artwork
    <img
      className={className}
      src="/icons/icon-192.png"
      alt=""
      width={size}
      height={size}
      decoding="async"
      style={{ borderRadius: radius, display: "block" }}
    />
  );
}