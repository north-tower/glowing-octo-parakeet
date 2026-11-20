import { FlamingoMarkSvg } from "@/components/app/FlamingoMarkSvg";

type Props = {
  /** Visual size in px. */
  size?: number;
  className?: string;
};

/** NakuruHub UI mark — SVG flamingo, not the PWA app-icon PNG. */
export function BrandLogoMark({ size = 28, className = "logo-mark" }: Props) {
  return <FlamingoMarkSvg size={size} className={className} />;
}