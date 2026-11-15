"use client";

import { useEffect, useRef, useState } from "react";
import { useNakuruApp } from "@/components/app/AppProvider";
import { CATS, SOON } from "@/lib/nakuru/data/constants";
import { ZONES } from "@/lib/nakuru/data/zones";
import type { CategoryId } from "@/lib/nakuru/types";

export function AppHeader() {
  const { state, dispatch, toast } = useNakuruApp();
  const [qLocal, setQLocal] = useState(state.q);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setQLocal(state.q);
  }, [state.q]);

  const onSearchInput = (value: string) => {
    setQLocal(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      dispatch({ type: "SET_Q", q: value });
    }, 120);
  };

  return (
    <header id="hd" className={`t-${state.tab}`}>
      <div className="row sp">
        <span className="logo">🦩 NakuruHub</span>
        <select
          id="area"
          aria-label="Your area"
          value={state.area}
          onChange={(e) =>
            dispatch({ type: "SET_AREA", area: e.target.value })
          }
        >
          {Object.keys(ZONES).map((z) => (
            <option key={z} value={z}>
              {z}
            </option>
          ))}
        </select>
      </div>
      <div className="search">
        <span>🔍</span>
        <input
          id="q"
          placeholder="Search shops, homes, cars, services"
          value={qLocal}
          onChange={(e) => onSearchInput(e.target.value)}
        />
        <button
          id="cam"
          type="button"
          aria-label="Search by photo"
          onClick={() => toast("Search by photo is coming soon")}
        >
          📷
        </button>
        <button
          id="go"
          type="button"
          aria-label="Search"
          onClick={() => dispatch({ type: "SET_TAB", tab: "home" })}
        >
          ⌕
        </button>
      </div>
      <div className="tabs" id="tabs">
        {CATS.map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`tb${state.cat === id ? " on" : ""}`}
            onClick={() =>
              dispatch({ type: "SET_CAT", cat: id as CategoryId })
            }
          >
            {label}
            {SOON[id as CategoryId] ? " (soon)" : ""}
          </button>
        ))}
      </div>
    </header>
  );
}