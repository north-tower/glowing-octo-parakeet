"use client";

import type { ElementType, HTMLAttributes } from "react";
import { useLandingLang } from "@/components/landing/LandingLangContext";

type BiProps = HTMLAttributes<HTMLElement> & {
  en: string;
  sw: string;
  as?: ElementType;
};

export function Bi({ en, sw, as: Tag = "span", children, ...rest }: BiProps) {
  const { lang } = useLandingLang();
  const text = lang === "sw" ? sw : en;
  return (
    <Tag data-en={en} data-sw={sw} {...rest}>
      {children ?? text}
    </Tag>
  );
}

type BiAriaProps = HTMLAttributes<HTMLElement> & {
  enAria: string;
  swAria: string;
  as?: ElementType;
};

export function BiAria({
  enAria,
  swAria,
  as: Tag = "div",
  children,
  ...rest
}: BiAriaProps) {
  const { lang } = useLandingLang();
  const label = lang === "sw" ? swAria : enAria;
  return (
    <Tag
      data-en-aria={enAria}
      data-sw-aria={swAria}
      aria-label={label}
      {...rest}
    >
      {children}
    </Tag>
  );
}