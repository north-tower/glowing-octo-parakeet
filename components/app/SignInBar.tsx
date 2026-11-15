"use client";

import { useAuth } from "@/components/app/AppAuthProvider";
import { useNakuruApp } from "@/components/app/AppProvider";

export function SignInBar() {
  const { state, dispatch } = useNakuruApp();
  const { user, ready } = useAuth();

  const signedIn = ready && Boolean(user);
  const hidden = !(state.tab === "home" && !state.me && !signedIn);

  return (
    <div id="sb" hidden={hidden}>
      <span>Sign in to start your business</span>
      <button
        type="button"
        className="btn s"
        onClick={() => dispatch({ type: "SET_TAB", tab: "acc" })}
      >
        Sign in
      </button>
    </div>
  );
}