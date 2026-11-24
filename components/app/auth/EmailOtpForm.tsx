"use client";

import { SignInForm } from "@/components/app/auth/SignInForm";

type Props = {
  /** After OTP, open Selling (apply / shop) instead of Account home. */
  openSellingAfterSignIn?: boolean;
  showGuestBrowse?: boolean;
};

/** Legacy export — same OTP logic as `SignInForm`. */
export function EmailOtpForm({
  openSellingAfterSignIn = false,
  showGuestBrowse = true,
}: Props) {
  return (
    <SignInForm
      openSellingAfterSignIn={openSellingAfterSignIn}
      showGuestBrowse={showGuestBrowse}
    />
  );
}