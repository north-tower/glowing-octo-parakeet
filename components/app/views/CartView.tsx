"use client";

import { useEffect } from "react";
import { useNakuruApp } from "@/components/app/AppProvider";
import { STAT } from "@/lib/nakuru/data/constants";
import { itemById } from "@/lib/nakuru/data/items";
import { ZONES } from "@/lib/nakuru/data/zones";
import { isOutsideArea } from "@/lib/nakuru/area";
import {
  cartSubtotal,
  effectivePay,
} from "@/lib/nakuru/reducer";
import { kes } from "@/lib/nakuru/format";

export function CartView() {
  const { state, dispatch, toast } = useNakuruApp();
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

  const mpesaOff = !allV;

  return (
    <>
      <h2 style={{ marginTop: 0 }}>Your cart</h2>
      {!ids.length ? (
        <div className="m">Your cart is empty. Add something from Shop.</div>
      ) : (
        <>
          {ids.map((id) => {
            const i = itemById(id);
            if (!i) return null;
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
                toast("M-Pesa upfront needs verified vendors only");
                return;
              }
              dispatch({ type: "SET_PAY", pay: "mpesa" });
            }}
          >
            <div>
              <div className="t">M-Pesa now</div>
              <div className="m">
                {allV
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
            disabled={isOutsideArea(state.area)}
            onClick={() => dispatch({ type: "PLACE_ORDER" })}
          >
            Place order · {kes(sub + fee)}
          </button>
        </>
      )}
      <h2>Your orders</h2>
      {!state.orders.length ? (
        <div className="m">No orders yet.</div>
      ) : (
        [...state.orders].reverse().map((o) => (
          <div key={o.id} className="card">
            <div className="row sp">
              <span className="t">Order #{o.id}</span>
              <span className="pr">{kes(o.total)}</span>
            </div>
            <div className="m">
              {o.pay} · {STAT[o.s]}
            </div>
            <div className="steps">
              {STAT.map((_, k) => (
                <i key={k} className={k <= o.s ? "d" : ""} />
              ))}
            </div>
            {o.s < 4 ? (
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
            ) : (
              <div className="m">Completed. Rate your vendor.</div>
            )}
          </div>
        ))
      )}
    </>
  );
}