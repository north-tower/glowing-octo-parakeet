import Image from "next/image";
import {
  BRAND_LOGO_LOCKUP,
  BRAND_LOGO_LOCKUP_HEIGHT,
  BRAND_LOGO_LOCKUP_WIDTH,
  BRAND_LOGO_MARK,
  BRAND_NAME,
} from "@/lib/nakuru/brand";

type Props = {
  /** Visual size in px. Height for lockup; width and height for the square mark. */
  size?: number;
  className?: string;
  priority?: boolean;
  /** `mark` is the square emblem; `lockup` includes the NakuruHub wordmark. */
  variant?: "mark" | "lockup";
};

/** NakuruHub flamingo mark and full lockup. */
export function BrandLogoMark({
  size = 28,
  className = "logo-mark",
  priority = false,
  variant = "mark",
}: Props) {
  if (variant === "lockup") {
    const height = size;
    const width = Math.round(
      (height * BRAND_LOGO_LOCKUP_WIDTH) / BRAND_LOGO_LOCKUP_HEIGHT,
    );
    return (
      <Image
        className={
          className && className !== "logo-mark"
            ? `logo-lockup ${className}`
            : "logo-lockup"
        }
        src={BRAND_LOGO_LOCKUP}
        width={width}
        height={height}
        alt={BRAND_NAME}
        priority={priority}
      />
    );
  }

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
