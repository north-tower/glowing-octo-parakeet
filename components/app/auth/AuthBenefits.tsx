import { BrandLogoMark } from "@/components/app/BrandLogoMark";
import {
  Heart,
  MessageSquareQuote,
  PackageCheck,
} from "lucide-react";

const ROWS = [
  {
    Icon: Heart,
    title: "Save listings you love",
    body: "Heart ads and find them again from your account.",
  },
  {
    Icon: MessageSquareQuote,
    title: "Request quotes from sellers",
    body: "Ask for prices on property, cars, and services.",
  },
  {
    Icon: PackageCheck,
    title: "Track your orders",
    body: "Follow delivery updates when you buy from a shop.",
  },
] as const;

export function AuthBenefits() {
  return (
    <div className="hidden lg:flex flex-col justify-center rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 p-10 text-emerald-50 shadow-lg">
      <BrandLogoMark variant="lockup" size={36} className="mb-8 brightness-0 invert" />
      <h2 className="text-3xl font-semibold tracking-tight text-white">
        Your city. Your market.
      </h2>
      <p className="mt-3 max-w-sm text-base text-emerald-100/90">
        One account for shopping, quotes, and selling across Nakuru.
      </p>
      <ul className="mt-10 flex flex-col gap-6" aria-label="Why sign in">
        {ROWS.map(({ Icon, title, body }) => (
          <li key={title} className="flex gap-4">
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-emerald-50"
              aria-hidden
            >
              <Icon className="h-5 w-5" strokeWidth={2} />
            </span>
            <div>
              <p className="font-semibold text-white">{title}</p>
              <p className="mt-0.5 text-sm text-emerald-100/85">{body}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}