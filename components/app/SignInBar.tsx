"use client";

import { useNakuruApp } from "@/components/app/AppProvider";

export function SignInBar() {
  const { state, dispatch } = useNakuruApp();
  const hidden = !(state.tab === "home" && !state.me);

  return (
    <div id="sb" hidden={hidden}>
      <span>Sign in to start your business</span>
      <button
        type="button"
        className="btn s"
        onClick={() => dispatch({ type: "SIGNIN" })}
      >
        Sign in
      </button>
    </div>
  );
}