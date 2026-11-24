import type { ReactNode } from "react";
import { AuthBenefits } from "@/components/app/auth/AuthBenefits";

type Props = {
  children: ReactNode;
  /** When false, only the form column (in-app account tab). */
  showBenefits?: boolean;
};

export function AuthShell({ children, showBenefits = true }: Props) {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-6 lg:min-h-[calc(100dvh-3.5rem)] lg:justify-center lg:px-8 lg:py-10">
      <div
        className={
          showBenefits
            ? "grid w-full items-center gap-10 lg:grid-cols-2 lg:gap-14"
            : "mx-auto w-full max-w-md"
        }
      >
        {showBenefits ? <AuthBenefits /> : null}
        <div className="w-full lg:mx-auto lg:max-w-md">{children}</div>
      </div>
    </main>
  );
}