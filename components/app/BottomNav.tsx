"use client";

import { useNakuruApp } from "@/components/app/AppProvider";
import { APP_TABS } from "@/lib/nakuru/app-tabs";
import { cartCount } from "@/lib/nakuru/reducer";

export function BottomNav() {
  const { state, dispatch } = useNakuruApp();
  const n = cartCount(state.cart);

  return (
    <nav id="nav" aria-label="Primary">
      <div className="app-nav-brand">
        <span className="logo">🦩 NakuruHub</span>
      </div>
      {APP_TABS.map(([id, icon, label]) => (
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