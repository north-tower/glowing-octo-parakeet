import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

export function ListingGrid({ children, className = "" }: Props) {
  return (
    <div className={`lc-grid${className ? ` ${className}` : ""}`}>
      {children}
    </div>
  );
}
