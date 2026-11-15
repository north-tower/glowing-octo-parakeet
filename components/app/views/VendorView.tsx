"use client";

import {
  Avatar,
  ProfilePhotoUpload,
} from "@/components/app/ProfilePhotoUpload";
import { useNakuruApp } from "@/components/app/AppProvider";
import { CATS, SOON, TOOLS, categoryName } from "@/lib/nakuru/data/constants";
import type { CategoryId } from "@/lib/nakuru/types";

export function VendorView() {
  const { state, dispatch } = useNakuruApp();
  const me = state.me;

  if (!me) {
    return (
      <>
        <h2>Sell on NakuruHub</h2>
        <div className="m">
          Free to join. Add a profile picture, then choose the categories you
          sell in. Each is approved separately.
        </div>
        <div className="row" style={{ marginTop: 12 }}>
          <ProfilePhotoUpload className="pfp" role="button" aria-label="Upload profile picture">
            <Avatar photo={state.photo} />
            <b>📷</b>
          </ProfilePhotoUpload>
          <div className="m">Tap to upload a profile picture or shop logo</div>
        </div>
        <label htmlFor="vn">Your name or business</label>
        <input
          id="vn"
          maxLength={60}
          autoComplete="organization"
          placeholder="e.g. Mama Fashions"
          value={state.vn}
          onChange={(e) =>
            dispatch({ type: "SET_VN", vn: e.target.value })
          }
        />
        <label htmlFor="vp">Phone (OTP verified)</label>
        <input
          id="vp"
          maxLength={16}
          autoComplete="tel"
          inputMode="tel"
          placeholder="07XX XXX XXX"
          value={state.vp}
          onChange={(e) =>
            dispatch({ type: "SET_VP", vp: e.target.value })
          }
        />
        <label>Categories (tap to add or remove)</label>
        <div>
          {CATS.slice(1).map((c) => {
            const on = state.vc.includes(c[0]);
            return (
              <button
                key={c[0]}
                type="button"
                className={`chip${on ? " on" : ""}`}
                onClick={() =>
                  dispatch({ type: "VC_TOGGLE", cat: c[0] as CategoryId })
                }
              >
                {c[1]}
                {SOON[c[0] as CategoryId] ? " (waitlist)" : ""}
              </button>
            );
          })}
        </div>
        <div className="warn">
          Next: upload your ID and category documents. Unverified vendors take
          cash on delivery only.
        </div>
        <button
          type="button"
          className="btn full"
          onClick={() => dispatch({ type: "REG_VENDOR" })}
        >
          Submit for approval
        </button>
      </>
    );
  }

  const ok = me.st === "Approved";

  return (
    <>
      <div className="card row">
        <ProfilePhotoUpload className="pfp" role="button" aria-label="Upload profile picture">
          <Avatar photo={state.photo} />
          <b>📷</b>
        </ProfilePhotoUpload>
        <div>
          <div className="t">{me.n}</div>
          <div className="m">
            Status: {me.st} ·{" "}
            {me.ver
              ? "✓ Verified (M-Pesa upfront enabled)"
              : "Basic (cash on delivery only)"}
          </div>
          {!ok ? (
            <div className="warn" style={{ marginTop: 8 }}>
              Waiting for approval. Open Admin panel in this demo to approve it.
            </div>
          ) : null}
        </div>
      </div>
      {ok
        ? me.cats.map((c) =>
            TOOLS[c] ? (
              <div key={c} className="card">
                <div className="t">{categoryName(c)} dashboard</div>
                {TOOLS[c].map((x) => (
                  <span key={x} className="tool">
                    {x}
                  </span>
                ))}
              </div>
            ) : (
              <div key={c} className="card">
                <div className="t">{categoryName(c)}</div>
                <div className="m">On the waitlist. We'll open it soon.</div>
              </div>
            ),
          )
        : null}
    </>
  );
}