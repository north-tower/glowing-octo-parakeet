"use client";

import { useNakuruApp } from "@/components/app/AppProvider";
import {
  FEAT,
  SIDE,
  SLIDES,
  SOON,
  TOPC,
  categoryName,
} from "@/lib/nakuru/data/constants";
import type { CategoryId } from "@/lib/nakuru/types";

export function CategoryView() {
  const { state, dispatch, toast } = useNakuruApp();
  const s = state.side;

  const ks: number[] = [];
  TOPC.forEach((t, k) => {
    if (s === "feat" ? FEAT.includes(k) : t[2] === s) ks.push(k);
  });

  return (
    <div className="cl">
      <div className="sd">
        {SIDE.map((x) => (
          <button
            key={x[0]}
            type="button"
            className={s === x[0] ? "on" : ""}
            onClick={() => dispatch({ type: "SET_SIDE", side: x[0] })}
          >
            <b>{x[2]}</b>
            {x[1]}
          </button>
        ))}
      </div>
      <div className="rp">
        {SOON[s as CategoryId] ? (
          <div className="card">
            <div className="t">Coming soon</div>
            <div className="m">
              We'll open this category soon. Join the waitlist.
            </div>
            <button
              type="button"
              className="btn s"
              style={{ marginTop: 8 }}
              onClick={() => toast("You're on the waitlist. We'll message you.")}
            >
              Notify me
            </button>
          </div>
        ) : (
          <>
            <div
              className="sl"
              style={{
                background: SLIDES[s === "feat" ? 0 : 1][0],
                borderRadius: 14,
                minHeight: 96,
              }}
              role="button"
              tabIndex={0}
              onClick={() => dispatch({ type: "SLIDE_SHOP" })}
            >
              <div>
                <b style={{ fontSize: 17 }}>
                  {s === "feat" ? "Free first delivery" : categoryName(s)}
                </b>
                <span>
                  {s === "feat" ? "Pay on delivery" : "Browse verified sellers"}
                </span>
              </div>
            </div>
            <div className="card" style={{ marginTop: 10 }}>
              <div className="row sp">
                <b>Top categories</b>
                <span
                  className="m"
                  role="button"
                  tabIndex={0}
                  onClick={() =>
                    dispatch({
                      type: "SET_CAT",
                      cat: (s === "feat" ? "all" : s) as CategoryId,
                    })
                  }
                >
                  All ›
                </span>
              </div>
              <div className="g3" style={{ marginTop: 10 }}>
                {ks.map((k) => {
                  const t = TOPC[k];
                  return (
                    <div
                      key={k}
                      className="ct"
                      role="button"
                      tabIndex={0}
                      onClick={() =>
                        dispatch({ type: "SELECT_TOPC", index: k })
                      }
                    >
                      <div>{t[0]}</div>
                      {t[1]}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}