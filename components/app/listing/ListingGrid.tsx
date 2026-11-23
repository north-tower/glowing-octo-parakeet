import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

export function ListingGrid({ children, className = "" }: Props) {
  return (
    <div
      className={`col-span-full grid grid-cols-2 items-stretch gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5 ${className}`}
    >
      {children}
    </div>
  );
}