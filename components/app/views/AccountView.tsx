"use client";

import { EmailOtpForm } from "@/components/app/auth/EmailOtpForm";
import {
  Avatar,
  ProfilePhotoUpload,
} from "@/components/app/ProfilePhotoUpload";
import { useAuth } from "@/components/app/AppAuthProvider";
import { AdminView } from "@/components/app/views/AdminView";
import { VendorView } from "@/components/app/views/VendorView";
import { useNakuruApp } from "@/components/app/AppProvider";

const ROWS: [string, string, string][] = [
  ["📦", "My orders", "tab:cart"],
  ["🏪", "Sell on NakuruHub", "acc:vendor"],
  ["❤️", "Saved items", "toast"],
  ["❓", "Help and support", "toast"],
];

const SHOW_DEMO_ADMIN = process.env.NODE_ENV === "development";

const ACCOUNT_ROWS: [string, string, string][] = SHOW_DEMO_ADMIN
  ? [...ROWS.slice(0, 2), ["🛠️", "Admin panel (demo)", "acc:admin"], ...ROWS.slice(2)]
  : ROWS;

export function AccountView() {
  const { state, dispatch, toast } = useNakuruApp();
  const { user, ready, logout } = useAuth();

  if (state.acc) {
    if (state.acc === "vendor" && ready && !user) {
      return (
        <>
          <button
            type="button"
            className="btn s o"
            onClick={() => dispatch({ type: "SET_ACC", acc: null })}
          >
            ‹ Back
          </button>
          <EmailOtpForm />
        </>
      );
    }

    return (
      <>
        <button
          type="button"
          className="btn s o"
          onClick={() => dispatch({ type: "SET_ACC", acc: null })}
        >
          ‹ Back
        </button>
        {state.acc === "vendor" ? (
          <VendorView />
        ) : SHOW_DEMO_ADMIN ? (
          <AdminView />
        ) : (
          <p className="m">
            Staff tools live at <code>/staff</code> (bookmark; not linked from the
            public app).
          </p>
        )}
      </>
    );
  }

  const signedIn = ready && user;

  if (!signedIn) {
    return (
      <>
        <EmailOtpForm />
        {ACCOUNT_ROWS.filter((r) => r[2] !== "acc:admin").map((r) => (
          <div
            key={r[2]}
            className="card li"
            role="button"
            tabIndex={0}
            onClick={() => dispatch({ type: "ACCOUNT_ROW", id: r[2] })}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                dispatch({ type: "ACCOUNT_ROW", id: r[2] });
              }
            }}
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

  const displayEmail = user.email ?? "Signed in";

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
        <div style={{ flex: 1 }}>
          <div className="t">{displayEmail}</div>
          <div className="m">Signed in · {user.role}</div>
        </div>
      </div>
      <button
        type="button"
        className="btn full o"
        onClick={() => {
          void logout().then(() => toast("Signed out"));
        }}
      >
        Sign out
      </button>
      {ACCOUNT_ROWS.map((r) => (
        <div
          key={r[2]}
          className="card li"
          role="button"
          tabIndex={0}
          onClick={() => dispatch({ type: "ACCOUNT_ROW", id: r[2] })}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              dispatch({ type: "ACCOUNT_ROW", id: r[2] });
            }
          }}
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