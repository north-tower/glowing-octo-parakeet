"use client";

import { useNakuruApp } from "@/components/app/AppProvider";
import { ITEMS } from "@/lib/nakuru/data/items";
import { kes } from "@/lib/nakuru/format";

export function AdminView() {
  const { state, dispatch } = useNakuruApp();

  const cod = state.orders.reduce(
    (a, o) => a + (o.pay === "Pay on delivery" && o.s < 4 ? o.total : 0),
    0,
  );

  return (
    <>
      <h2>Admin panel</h2>
      <div className="warn">
        Demo only. A real admin area needs staff login and server-side role
        checks.
      </div>
      <div className="card row">
        <div className="stat">
          <b>{ITEMS.length + state.apps.length}</b>
          <span className="m">Listings + vendors</span>
        </div>
        <div className="stat">
          <b>{state.orders.length}</b>
          <span className="m">Orders</span>
        </div>
        <div className="stat">
          <b>{kes(cod)}</b>
          <span className="m">COD pending</span>
        </div>
      </div>
      <h2>Vendor applications</h2>
      {state.apps.map((a, k) => (
        <div key={`${a.n}-${k}`} className="card">
          <div className="t">{a.n}</div>
          <div className="m">
            {a.cats.join(", ")} · {a.st}
            {a.ver ? " · Verified" : ""}
          </div>
          <div className="row" style={{ marginTop: 8 }}>
            {a.st === "Pending" ? (
              <button
                type="button"
                className="btn s"
                onClick={() => dispatch({ type: "APP_APPROVE", index: k })}
              >
                Approve
              </button>
            ) : null}
            {!a.ver && a.st === "Approved" ? (
              <button
                type="button"
                className="btn s o"
                onClick={() => dispatch({ type: "APP_VERIFY", index: k })}
              >
                Give Verified badge
              </button>
            ) : null}
          </div>
        </div>
      ))}
      <div className="m">
        Also managed here: zones and fees, commissions, riders, cash
        reconciliation, payouts, reports.
      </div>
    </>
  );
}