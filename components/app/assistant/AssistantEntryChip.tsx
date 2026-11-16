"use client";

import { IconSparkle } from "@/components/app/icons/LineIcons";

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
      <IconSparkle size={20} aria-hidden />
      <span>{label}</span>
    </button>
  );
}