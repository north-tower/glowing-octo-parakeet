"use client";

import {
  Avatar,
  ProfilePhotoUpload,
} from "@/components/app/ProfilePhotoUpload";
import { AdminView } from "@/components/app/views/AdminView";
import { VendorView } from "@/components/app/views/VendorView";
import { useNakuruApp } from "@/components/app/AppProvider";

const ROWS: [string, string, string][] = [
  ["📦", "My orders", "tab:cart"],
  ["🏪", "Sell on NakuruHub", "acc:vendor"],
  ["🛠️", "Admin panel (demo)", "acc:admin"],
  ["❤️", "Saved items", "toast"],
  ["❓", "Help and support", "toast"],
];

export function AccountView() {
  const { state, dispatch } = useNakuruApp();

  if (state.acc) {
    return (
      <>
        <button
          type="button"
          className="btn s o"
          onClick={() => dispatch({ type: "SET_ACC", acc: null })}
        >
          ‹ Back
        </button>
        {state.acc === "vendor" ? <VendorView /> : <AdminView />}
      </>
    );
  }

  return (
    <>
      <div className="card row">
        <ProfilePhotoUpload
          className="av"
          role="button"
          aria-label="Upload profile picture"
        >
          <Avatar photo={state.photo} />
        </ProfilePhotoUpload>
        <div>
          <div className="t">{state.me ? state.me.n : "Guest"}</div>
          <div className="m">
            {state.me
              ? `Vendor account · ${state.me.st}`
              : "Free to join. Sign in to sell."}
          </div>
        </div>
      </div>
      {ROWS.map((r) => (
        <div
          key={r[2]}
          className="card li"
          role="button"
          tabIndex={0}
          onClick={() => dispatch({ type: "ACCOUNT_ROW", id: r[2] })}
        >
          <div className="av">{r[0]}</div>
          <div className="t" style={{ flex: 1 }}>
            {r[1]}
          </div>
          <span className="m">›</span>
        </div>
      ))}
    </>
  );
}