"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/app/AppAuthProvider";
import { useNakuruApp } from "@/components/app/AppProvider";
import { STAT } from "@/lib/nakuru/data/constants";
import { PHONE_REGEX } from "@/lib/nakuru/data/constants";
import { itemById } from "@/lib/nakuru/data/items";
import { ZONES } from "@/lib/nakuru/data/zones";
import { isOutsideArea } from "@/lib/nakuru/area";
import { isLiveCatalogEnabled } from "@/lib/nakuru/catalog-live";
import {
  apiOrderToUi,
  checkoutErrorMessage,
  fetchMyOrders,
  placeOrder,
} from "@/lib/nakuru/orders";
import {
  cartSubtotal,
  effectivePay,
} from "@/lib/nakuru/reducer";
import { kes } from "@/lib/nakuru/format";
import { requestInstallRetrigger } from "@/lib/nakuru/pwa-engage";

export function CartView() {
  const { state, dispatch, toast } = useNakuruApp();
  const { user, ready: authReady } = useAuth();
  const liveCatalog = isLiveCatalogEnabled();

  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [placing, setPlacing] = useState(false);

  const ids = Object.keys(state.cart);
  const sub = cartSubtotal(state.cart);
  const fee = ZONES[state.area] ?? 0;

  let allV = true;
  ids.forEach((id) => {
    const item = itemById(id);
    if (item && !item.v) allV = false;
  });

  const pay = effectivePay(state);

  useEffect(() => {
    if (!allV && state.pay === "mpesa") {
      dispatch({ type: "SET_PAY", pay: "cod" });
    }
  }, [allV, state.pay, dispatch]);

  useEffect(() => {
    if (!liveCatalog || !authReady || !user) return;
    let cancelled = false;
    fetchMyOrders()
      .then((rows) => {
        if (cancelled) return;
        dispatch({
          type: "SET_ORDERS",
          orders: rows.map(apiOrderToUi),
        });
      })
      .catch(() => {
        /* keep demo or prior orders */
      });
    return () => {
      cancelled = true;
    };
  }, [liveCatalog, authReady, user, dispatch]);

  const mpesaOff = !allV || liveCatalog;

  const placeDemoOrder = useCallback(() => {
    dispatch({ type: "PLACE_ORDER" });
  }, [dispatch]);

  const placeLiveOrder = useCallback(async () => {
    if (!user) {
      toast("Sign in on the Account tab to check out.");
      dispatch({ type: "SET_TAB", tab: "acc" });
      return;
    }

    const addr = address.trim();
    if (addr.length < 3) {
      toast("Enter your delivery address (estate, street, landmark).");
      return;
    }

    const rawPhone = phone.replace(/[\s-]/g, "");
    if (rawPhone && !PHONE_REGEX.test(rawPhone)) {
      toast("Enter a valid Kenyan phone, e.g. 0712 345 678");
      return;
    }

    const items = ids
      .map((id) => ({ productId: id, qty: state.cart[id] ?? 0 }))
      .filter((row) => row.qty > 0);

    const missing = items.some((row) => !itemById(row.productId));
    if (missing) {
      toast("Something in your cart is no longer listed. Remove it and try again.");
      return;
    }

    const payment = pay === "mpesa" && allV && !liveCatalog ? "mpesa" : "cod";

    setPlacing(true);
    try {
      const created = await placeOrder({
        items,
        zone: state.area,
        payment,
        address: addr,
        ...(rawPhone ? { phone: rawPhone } : {}),
      });
      const ui = created.map(apiOrderToUi);
      dispatch({ type: "CLEAR_CART" });
      dispatch({ type: "APPEND_ORDERS", orders: ui });
      const label =
        created.length === 1
          ? `Order placed · #${created[0]!.id.slice(0, 8)}`
          : `${created.length} orders placed`;
      toast(label);
      requestInstallRetrigger();
      window.dispatchEvent(new Event("nh:engage"));
      setAddress("");
      setPhone("");
    } catch (err) {
      toast(checkoutErrorMessage(err));
    } finally {
      setPlacing(false);
    }
  }, [
    user,
    address,
    phone,
    ids,
    state.cart,
    state.area,
    pay,
    allV,
    liveCatalog,
    dispatch,
    toast,
  ]);

  const onPlaceOrder = () => {
    if (isOutsideArea(state.area) || !ids.length) return;
    if (liveCatalog) {
      void placeLiveOrder();
    } else {
      placeDemoOrder();
    }
  };

  return (
    <>
      <h2 style={{ marginTop: 0 }}>Your cart</h2>
      {!ids.length ? (
        <div className="m">Your cart is empty. Add something from Shop.</div>
      ) : (
        <>
          {ids.map((id) => {
            const i = itemById(id);
            if (!i) {
              return (
                <div key={id} className="card row sp">
                  <div className="m">This listing is no longer available.</div>
                  <button
                    type="button"
                    className="btn s o"
                    onClick={() => dispatch({ type: "CART_DEC", id })}
                  >
                    Remove
                  </button>
                </div>
              );
            }
            const n = state.cart[id] ?? 0;
            return (
              <div key={id} className="card row sp">
                <div>
                  <div className="t">
                    {i.e} {i.t}
                  </div>
                  <div className="m">{i.s}</div>
                  <div className="pr">{kes(i.p * n)}</div>
                </div>
                <div className="row">
                  <button
                    type="button"
                    className="btn s o"
                    onClick={() => dispatch({ type: "CART_DEC", id })}
                  >
                    −
                  </button>
                  <b>{n}</b>
                  <button
                    type="button"
                    className="btn s o"
                    onClick={() => dispatch({ type: "CART_INC", id })}
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
          <div className="card">
            <div className="row sp">
              <span>Subtotal</span>
              <span>{kes(sub)}</span>
            </div>
            <div className="row sp">
              <span>Delivery to {state.area}</span>
              <span>{kes(fee)}</span>
            </div>
            <div className="row sp pr">
              <span>Total</span>
              <span>{kes(sub + fee)}</span>
            </div>
          </div>

          {liveCatalog ? (
            <>
              <h2>Delivery details</h2>
              <label className="m" htmlFor="checkout-address">
                Address (estate, street, landmark)
              </label>
              <input
                id="checkout-address"
                className="inp full"
                value={address}
                maxLength={200}
                autoComplete="street-address"
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Section 58, near Naivas"
              />
              <label className="m" htmlFor="checkout-phone" style={{ marginTop: 12 }}>
                Phone for rider / SMS updates
              </label>
              <input
                id="checkout-phone"
                className="inp full"
                type="tel"
                inputMode="tel"
                value={phone}
                maxLength={16}
                autoComplete="tel"
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0712 345 678"
              />
              <p className="m" style={{ marginTop: 8 }}>
                Used so the rider can call you — not for sign-in codes.
              </p>
              {!user && authReady ? (
                <div className="err" style={{ marginTop: 12 }}>
                  Sign in on the Account tab to place a live order.
                </div>
              ) : null}
            </>
          ) : null}

          <h2>Payment</h2>
          <div
            className={`pay${pay === "cod" ? " on" : ""}`}
            role="button"
            tabIndex={0}
            onClick={() => dispatch({ type: "SET_PAY", pay: "cod" })}
          >
            <div>
              <div className="t">Pay on delivery</div>
              <div className="m">Cash or M-Pesa to the rider</div>
            </div>
          </div>
          <div
            className={`pay${pay === "mpesa" ? " on" : ""}${mpesaOff ? " off" : ""}`}
            role="button"
            tabIndex={0}
            onClick={() => {
              if (mpesaOff) {
                toast(
                  liveCatalog
                    ? "Live checkout uses pay on delivery for now"
                    : "M-Pesa upfront needs verified vendors only",
                );
                return;
              }
              dispatch({ type: "SET_PAY", pay: "mpesa" });
            }}
          >
            <div>
              <div className="t">M-Pesa now</div>
              <div className="m">
                {liveCatalog
                  ? "Coming soon on live orders"
                  : allV
                    ? "Available: all vendors are verified"
                    : "Only for verified vendors"}
              </div>
            </div>
          </div>
          {isOutsideArea(state.area) ? (
            <div className="err">
              We deliver within Nakuru only. Change your area at the top.
            </div>
          ) : null}
          <button
            type="button"
            className="btn a full"
            disabled={isOutsideArea(state.area) || placing}
            onClick={onPlaceOrder}
          >
            {placing
              ? "Placing order…"
              : `Place order · ${kes(sub + fee)}`}
          </button>
        </>
      )}
      <h2>Your orders</h2>
      {!state.orders.length ? (
        <div className="m">
          {liveCatalog
            ? "No orders yet. After checkout you will see them here."
            : "No orders yet."}
        </div>
      ) : (
        [...state.orders].reverse().map((o) => (
          <div key={String(o.id)} className="card">
            <div className="row sp">
              <span className="t">
                Order #{typeof o.id === "string" ? o.id.slice(0, 8) : o.id}
              </span>
              <span className="pr">{kes(o.total)}</span>
            </div>
            <div className="m">
              {o.pay}
              {o.live && o.status ? ` · ${o.status.replaceAll("_", " ")}` : null}
              {!o.live ? ` · ${STAT[o.s]}` : null}
            </div>
            {!o.live ? (
              <div className="steps">
                {STAT.map((_, k) => (
                  <i key={k} className={k <= o.s ? "d" : ""} />
                ))}
              </div>
            ) : null}
            {!o.live && o.s < 4 ? (
              <>
                <div className="m">
                  Delivery code: <b>{o.code}</b> (give it to the rider)
                </div>
                <button
                  type="button"
                  className="btn s o"
                  style={{ marginTop: 8 }}
                  onClick={() =>
                    dispatch({ type: "ADV_ORDER", id: o.id })
                  }
                >
                  Next status (demo)
                </button>
              </>
            ) : null}
            {o.live && o.status !== "delivered" && o.status !== "cancelled" ? (
              <>
                {o.code && o.code !== "----" ? (
                  <div className="m">
                    Delivery code: <b>{o.code}</b> (give it to the rider)
                  </div>
                ) : null}
                <div className="m" style={{ marginTop: 8 }}>
                  Track updates here after the vendor accepts your order.
                </div>
              </>
            ) : null}
            {!o.live && o.s >= 4 ? (
              <div className="m">Completed. Rate your vendor.</div>
            ) : null}
          </div>
        ))
      )}
    </>
  );
}