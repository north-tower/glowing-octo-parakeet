"use client";

import { useNakuruApp } from "@/components/app/AppProvider";
import { cartCount } from "@/lib/nakuru/reducer";
import type { TabId } from "@/lib/nakuru/types";

const TABS: [TabId, string, string][] = [
  ["home", "🏠", "Home"],
  ["cat", "🗂️", "Category"],
  ["msg", "💬", "Message"],
  ["cart", "🛒", "Cart"],
  ["acc", "👤", "Account"],
];

export function BottomNav() {
  const { state, dispatch } = useNakuruApp();
  const n = cartCount(state.cart);

  return (
    <nav id="nav">
      {TABS.map(([id, icon, label]) => (
        <button
          key={id}
          type="button"
          className={state.tab === id ? "on" : ""}
          onClick={() => dispatch({ type: "SET_TAB", tab: id })}
        >
          <b>{icon}</b>
          {label}
          {id === "cart" && n > 0 ? <em>{n}</em> : null}
        </button>
      ))}
    </nav>
  );
}