"use client";

import { BrandLogoMark } from "@/components/app/BrandLogoMark";
import { BRAND_NAME } from "@/lib/nakuru/brand";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useStaffSession } from "./StaffSessionContext";

type NavItem = { href: string; label: string };

function navForRole(role: "admin" | "support"): NavItem[] {
  const shared: NavItem[] = [
    { href: "/staff/vendors", label: "Vendors" },
    { href: "/staff/listings", label: "Listings" },
    { href: "/staff/inquiries", label: "Inquiries" },
  ];
  if (role === "support") return shared;
  return [
    { href: "/staff", label: "Overview" },
    { href: "/staff/audit", label: "Audit" },
    ...shared,
    { href: "/staff/categories", label: "Categories" },
    { href: "/staff/promotions", label: "Hero carousel" },
    { href: "/staff/orders", label: "Orders" },
  ];
}

export function StaffConsoleLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { me, signOut } = useStaffSession();
  const nav = navForRole(me.role);

  return (
    <>
      <header className="staff-ops-header">
        <div className="logo">
          <BrandLogoMark size={28} /> {BRAND_NAME} Operations
        </div>
        <span className="m staff-ops-sub">Masterclass</span>
      </header>
      <div className="staff-ops-frame">
        <nav className="staff-ops-nav" aria-label="Operations">
          {nav.map((item) => {
            const active =
              item.href === "/staff"
                ? pathname === "/staff"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`staff-ops-nav-link${active ? " on" : ""}`}
              >
                {item.label}
              </Link>
            );
          })}
          <button type="button" className="btn s o staff-ops-signout" onClick={signOut}>
            Sign out
          </button>
          <span className="staff-ops-role">
            {me.role === "admin" ? "Admin" : "Support"} · {me.email}
          </span>
        </nav>
        <main className="staff-ops-main">{children}</main>
      </div>
    </>
  );
}