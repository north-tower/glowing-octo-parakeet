"use client";

import { BrandLogoMark } from "@/components/app/BrandLogoMark";

type Props = {
  label: string;
  onClick: () => void;
  className?: string;
};

export function AssistantEntryChip({ label, onClick, className = "" }: Props) {
  return (
    <button
      type="button"
      className={`assistant-entry-chip${className ? ` ${className}` : ""}`}
      onClick={onClick}
    >
      <BrandLogoMark size={20} className="" />
      <span>{label}</span>
    </button>
  );
}