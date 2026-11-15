"use client";

import { useNakuruApp } from "@/components/app/AppProvider";

export function Fab() {
  const { state, dispatch } = useNakuruApp();

  return (
    <button
      className="fab"
      id="fab"
      type="button"
      aria-label="Chat"
      hidden={state.tab === "msg"}
      onClick={() => dispatch({ type: "SET_TAB", tab: "msg" })}
    >
      💬
    </button>
  );
}