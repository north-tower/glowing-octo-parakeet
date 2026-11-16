import { BRAND_LOGO } from "@/lib/nakuru/brand";

type Props = {
  /** Visual size in px (emoji scales via font-size). */
  size?: number;
  className?: string;
};

export function BrandLogoMark({ size = 22, className = "logo-mark" }: Props) {
  return (
    <span
      className={className}
      aria-hidden
      style={{ fontSize: size, lineHeight: 1, display: "inline-block" }}
    >
      {BRAND_LOGO}
    </span>
  );
}