import type { ReactNode } from "react";
import {
  IconCar,
  IconHome,
  IconPromoDelivery,
  IconShieldCheck,
} from "@/components/app/icons/LineIcons";

type SlideIconBadgeProps = {
  tint: "teal" | "sand" | "fl";
  children: ReactNode;
  secondary?: ReactNode;
};

function SlideIconArt({ tint, children, secondary }: SlideIconBadgeProps) {
  return (
    <div className="sl-art sl-art-icon" aria-hidden>
      <div className="sl-art-idle">
        <span className={`sl-icon-badge sl-icon-badge--${tint}`}>
          {children}
        </span>
        {secondary ? (
          <span
            className={`sl-icon-badge sl-icon-badge--sand sl-icon-badge--secondary`}
            aria-hidden
          >
            {secondary}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function SlideArtDelivery() {
  return (
    <SlideIconArt tint="teal">
      <IconPromoDelivery size={44} />
    </SlideIconArt>
  );
}

export function SlideArtProperty() {
  return (
    <SlideIconArt tint="sand" secondary={<IconCar size={30} />}>
      <IconHome size={44} />
    </SlideIconArt>
  );
}

export function SlideArtVerified() {
  return (
    <SlideIconArt tint="fl">
      <IconShieldCheck size={44} />
    </SlideIconArt>
  );
}