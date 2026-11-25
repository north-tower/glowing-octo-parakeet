"use client";

import {
  Avatar,
  ProfilePhotoUpload,
} from "@/components/app/ProfilePhotoUpload";
import { useAuth } from "@/components/app/AppAuthProvider";
import { useNakuruApp } from "@/components/app/AppProvider";
import { VendorApplyForm } from "@/components/app/vendor/VendorApplyForm";
import { VendorShopWorkspace } from "@/components/app/vendor/VendorShopWorkspace";
import { apiFetch, ApiError } from "@/lib/nakuru/api";
import { useLiveApi } from "@/lib/nakuru/api-mode";
import { CATS } from "@/lib/nakuru/data/constants";
import type { CategoryId } from "@/lib/nakuru/types";
import {
  pickPrimaryVendor,
  vendorStatusLabel,
  type ApiVendorRow,
} from "@/lib/nakuru/vendor-profile";
import { LoadingBlock, VendorWorkspaceSkeleton } from "@/components/app/loading/LoadingUi";
import { useCallback, useEffect, useState } from "react";

function LiveVendorPanel() {
  const { user: authUser, ready } = useAuth();
  const { state, toast } = useNakuruApp();
  const [rows, setRows] = useState<ApiVendorRow[] | null>(null);
  const [loadError, setLoadError] = useState(false);

  const loadMine = useCallback(async () => {
    if (!authUser) {
      setRows(null);
      return;
    }
    try {
      const data = await apiFetch<ApiVendorRow[]>("/api/vendors/mine");
      setRows(data);
      setLoadError(false);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setRows([]);
        return;
      }
      setLoadError(true);
    }
  }, [authUser]);

  useEffect(() => {
    if (!ready) return;
    void loadMine();
  }, [ready, loadMine]);

  const primary = rows ? pickPrimaryVendor(rows) : null;
  const pendingPoll = primary?.status === "pending";

  useEffect(() => {
    if (!pendingPoll || !authUser) return;
    const id = window.setInterval(() => void loadMine(), 30_000);
    return () => window.clearInterval(id);
  }, [pendingPoll, authUser, loadMine]);

  if (!ready) {
    return <LoadingBlock label="Loading…" compact />;
  }

  if (!authUser) {
    return (
      <>
        <h2>Sell on NakuruHub</h2>
        <div className="warn">
          Sign in with your email code on the Account tab before applying.
        </div>
      </>
    );
  }

  if (rows === null) {
    return <VendorWorkspaceSkeleton />;
  }

  if (loadError) {
    return (
      <>
        <div className="warn">Could not load your vendor status.</div>
        <button type="button" className="btn s" onClick={() => void loadMine()}>
          Retry
        </button>
      </>
    );
  }

  if (!primary) {
    return (
      <VendorApplyForm
        onApplied={() => void loadMine()}
        toast={toast}
      />
    );
  }

  const approved = primary.status === "approved";
  const vendorPhoto = primary.logo_url || state.photo;

  return (
    <>
      {approved ? (
        <VendorShopWorkspace
          vendor={primary}
          photo={vendorPhoto}
          toast={toast}
          onAreaChange={(area) => {
            setRows((prev) =>
              prev
                ? prev.map((row) =>
                    row.id === primary.id ? { ...row, area } : row,
                  )
                : prev,
            );
          }}
          onBannerChange={(banner_url) => {
            setRows((prev) =>
              prev
                ? prev.map((row) =>
                    row.id === primary.id ? { ...row, banner_url } : row,
                  )
                : prev,
            );
          }}
          onWhatsAppChange={(whatsapp) => {
            setRows((prev) =>
              prev
                ? prev.map((row) =>
                    row.id === primary.id ? { ...row, whatsapp } : row,
                  )
                : prev,
            );
          }}
        />
      ) : (
        <div className="card row">
          <ProfilePhotoUpload
            className="pfp"
            role="button"
            aria-label="Upload profile picture"
          >
            <Avatar photo={vendorPhoto} />
            <b>📷</b>
          </ProfilePhotoUpload>
          <div>
            <div className="t">{primary.name}</div>
            <div className="m">
              Status: {vendorStatusLabel(primary.status)} ·{" "}
              {primary.verified
                ? "Verified (M-Pesa upfront enabled)"
                : "Basic (cash on delivery only)"}
            </div>
            {primary.status === "pending" ? (
              <div className="warn" style={{ marginTop: 8 }}>
                Waiting for staff review. This page refreshes automatically.
              </div>
            ) : null}
            {primary.status === "rejected" ? (
              <div className="warn" style={{ marginTop: 8 }}>
                This application was not approved. You can submit a new one
                below.
              </div>
            ) : null}
          </div>
        </div>
      )}

      {primary.status === "rejected" ? (
        <VendorApplyForm onApplied={() => void loadMine()} toast={toast} />
      ) : null}
    </>
  );
}

function DemoVendorPanel() {
  const { state, dispatch, toast } = useNakuruApp();
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
          <ProfilePhotoUpload
            className="pfp"
            role="button"
            aria-label="Upload profile picture"
          >
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
          onChange={(e) => dispatch({ type: "SET_VN", vn: e.target.value })}
        />
        <label htmlFor="vp">Phone (optional, for deliveries)</label>
        <input
          id="vp"
          maxLength={16}
          autoComplete="tel"
          inputMode="tel"
          placeholder="07XX XXX XXX"
          value={state.vp}
          onChange={(e) => dispatch({ type: "SET_VP", vp: e.target.value })}
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
        <ProfilePhotoUpload
          className="pfp"
          role="button"
          aria-label="Upload profile picture"
        >
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
      {ok ? (
        <div className="card">
          <div className="t">Shop workspace</div>
          <div className="m">
            Sign in on a live session to add listings, manage stock, and see
            orders. Demo mode does not publish to the catalog.
          </div>
        </div>
      ) : null}
    </>
  );
}

export function VendorView() {
  const liveApi = useLiveApi();
  if (liveApi) return <LiveVendorPanel />;
  return <DemoVendorPanel />;
}
