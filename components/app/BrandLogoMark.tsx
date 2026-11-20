import Image from "next/image";
import { BRAND_LOGO_MARK } from "@/lib/nakuru/brand";

type Props = {
  /** Visual size in px. */
  size?: number;
  className?: string;
  priority?: boolean;
};

/** NakuruHub UI mark — sunset flamingo; same artwork as PWA icons (`lib/nakuru/flamingo-mark-source.png`). */
export function BrandLogoMark({
  size = 28,
  className = "logo-mark",
  priority = false,
}: Props) {
  return (
    <Image
      className={className}
      src={BRAND_LOGO_MARK}
      width={size}
      height={size}
      alt=""
      aria-hidden
      priority={priority}
    />
  );
}