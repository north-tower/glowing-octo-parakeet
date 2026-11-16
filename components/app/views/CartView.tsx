"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { useAuth } from "@/components/app/AppAuthProvider";
import { useNakuruApp } from "@/components/app/AppProvider";
import { ZoneSheet } from "@/components/app/ZoneSheet";
import { CartDeliveryForm, validateCheckoutFields } from "@/components/app/cart/CartDeliveryForm";
import { CartItemMissing, CartItemRow } from "@/components/app/cart/CartItemRow";
import { CartOrdersList } from "@/components/app/cart/CartOrdersList";
import { OrderPlacedSuccess } from "@/components/app/cart/OrderPlacedSuccess";
import { OrderTrackView } from "@/components/app/cart/OrderTrackView";
import { CartPaymentOptions } from "@/components/app/cart/CartPaymentOptions";
import { CartPromoRow } from "@/components/app/cart/CartPromoRow";
import { CartSummary, cartDisplayTotal } from "@/components/app/cart/CartSummary";
import { IconShoppingCart } from "@/components/app/icons/LineIcons";
import { usePwaInstall } from "@/components/app/pwa/InstallProvider";
import { firstOrderPromoState } from "@/lib/nakuru/cart-first-order";
import {
  clearCheckoutFields,
  hasCheckoutFieldsSaved,
  readCheckoutAddress,
  readCheckoutPhone,
  writeCheckoutFields,
} from "@/lib/nakuru/cart-checkout-storage";
import { isLiveCatalogEnabled } from "@/lib/nakuru/catalog-live";
import { isOutsideArea } from "@/lib/nakuru/area";
import { itemById } from "@/lib/nakuru/data/items";
import { ZONES } from "@/lib/nakuru/data/zones";
import { homeCopy } from "@/lib/nakuru/home-i18n";
import { kes } from "@/lib/nakuru/format";
import {
  apiOrderToUi,
  checkoutErrorMessage,
  fetchMyOrders,
  placeOrder,
} from "@/lib/nakuru/orders";
import { consumeOpenCartSegment } from "@/lib/nakuru/post-cart-segment";
import { requestPostSignInTab } from "@/lib/nakuru/post-sign-in-tab";
import { requestInstallRetrigger } from "@/lib/nakuru/pwa-engage";
import {
  buildDemoPlaceOrder,
  cartSubtotal,
  effectivePay,
} from "@/lib/nakuru/reducer";
import type { Order } from "@/lib/nakuru/types";

type CartSegment = "cart" | "orders";

type UndoPayload = { id: string | number; qty: number } | null;

export function CartView() {
  const { state, dispatch, toast } = useNakuruApp();
  const { user, ready: authReady } = useAuth();
  const { lang } = usePwaInstall();
  const liveCatalog = isLiveCatalogEnabled();

  const [segment, setSegment] = useState<CartSegment>("cart");
  const [zoneOpen, setZoneOpen] = useState(false);
  const [address, setAddress] = useState(() => readCheckoutAddress());
  const [phone, setPhone] = useState(() => readCheckoutPhone());
  const [placing, setPlacing] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    address?: string;
    phone?: string;
  }>({});
  const [undo, setUndo] = useState<UndoPayload>(null);
  const [trackingId, setTrackingId] = useState<string | number | null>(null);
  const [placedSuccess, setPlacedSuccess] = useState<Order | null>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const segCartRef = useRef<HTMLButtonElement>(null);
  const segOrdersRef = useRef<HTMLButtonElement>(null);

  const ids = Object.keys(state.cart);
  const sub = cartSubtotal(state.cart);
  const fee = ZONES[state.area] ?? 0;
  const outside = isOutsideArea(state.area);

  const allV = useMemo(() => {
    return ids.every((id) => {
      const item = itemById(id);
      return !item || item.v;
    });
  }, [ids]);

  const pay = effectivePay(state);
  const promo = firstOrderPromoState(
    Boolean(user),
    state.orders.length,
    state.area,
  );
  const displayTotal = cartDisplayTotal(sub, fee, promo);

  const mpesaReason = !allV ? "unverified" : liveCatalog ? "soon" : null;
  const mpesaDisabled = !allV || liveCatalog;

  useEffect(() => {
    if (!allV && state.pay === "mpesa") {
      dispatch({ type: "SET_PAY", pay: "cod" });
    }
  }, [allV, state.pay, dispatch]);

  useEffect(() => {
    if (state.tab !== "cart") return;
    const openSeg = consumeOpenCartSegment();
    if (openSeg === "orders") setSegment("orders");
  }, [state.tab]);

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

  const savedHint = hasCheckoutFieldsSaved();

  const persistCheckout = () => {
    writeCheckoutFields(address, phone);
  };

  const clearSaved = () => {
    clearCheckoutFields();
    setAddress("");
    setPhone("");
    setFieldErrors({});
  };

  const onBlurAddress = () => {
    persistCheckout();
    const errs = validateCheckoutFields(address, phone, lang, liveCatalog);
    setFieldErrors((prev) => ({
      ...prev,
      address: errs.address,
    }));
  };

  const onBlurPhone = () => {
    persistCheckout();
    const errs = validateCheckoutFields(address, phone, lang, liveCatalog);
    setFieldErrors((prev) => ({
      ...prev,
      phone: errs.phone,
    }));
  };

  const onRemoved = (id: string | number, qty: number) => {
    setUndo({ id, qty });
    if (undoTimer.current) clearTimeout(undoTimer.current);
    undoTimer.current = setTimeout(() => setUndo(null), 4000);
  };

  const undoRemove = () => {
    if (!undo) return;
    for (let i = 0; i < undo.qty; i += 1) {
      dispatch({ type: "CART_INC", id: String(undo.id) });
    }
    setUndo(null);
    if (undoTimer.current) clearTimeout(undoTimer.current);
  };

  const openPlacedSuccess = useCallback((created: Order[]) => {
    if (created[0]) setPlacedSuccess(created[0]);
    setTrackingId(null);
    setSegment("orders");
  }, []);

  const placeDemoOrder = useCallback(() => {
    const preview = buildDemoPlaceOrder(state);
    if (!preview) return;
    dispatch({ type: "PLACE_ORDER" });
    const order =
      promo === "eligible"
        ? { ...preview, promoFreeDelivery: true }
        : preview;
    openPlacedSuccess([order]);
  }, [dispatch, openPlacedSuccess, promo, state]);

  const placeLiveOrder = useCallback(async () => {
    const errs = validateCheckoutFields(address, phone, lang, true);
    setFieldErrors(errs);
    if (Object.keys(errs).length) return;

    if (!user) {
      requestPostSignInTab("cart");
      dispatch({ type: "SET_TAB", tab: "acc" });
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
    const rawPhone = phone.replace(/[\s-]/g, "");

    setPlacing(true);
    try {
      const created = await placeOrder({
        items,
        zone: state.area,
        payment,
        address: address.trim(),
        ...(rawPhone ? { phone: rawPhone } : {}),
      });
      const wasPromo = promo === "eligible";
      const ui = created.map((row) => {
        const base = apiOrderToUi(row);
        return {
          ...base,
          promoFreeDelivery: wasPromo,
          address: address.trim(),
        };
      });
      dispatch({ type: "CLEAR_CART" });
      dispatch({ type: "APPEND_ORDERS", orders: ui });
      toast(homeCopy("orderPlacedTitle", lang));
      requestInstallRetrigger();
      window.dispatchEvent(new Event("nh:engage"));
      openPlacedSuccess(ui);
    } catch (err) {
      toast(checkoutErrorMessage(err));
    } finally {
      setPlacing(false);
    }
  }, [
    user,
    address,
    phone,
    lang,
    ids,
    state.cart,
    state.area,
    pay,
    allV,
    liveCatalog,
    dispatch,
    toast,
    promo,
    openPlacedSuccess,
  ]);

  const onPlaceOrder = () => {
    if (outside || !ids.length) return;

    if (liveCatalog) {
      if (!user) return;
      const errs = validateCheckoutFields(address, phone, lang, true);
      setFieldErrors(errs);
      if (Object.keys(errs).length) return;
      void placeLiveOrder();
    } else {
      placeDemoOrder();
    }
  };

  const onSignIn = () => {
    requestPostSignInTab("cart");
    dispatch({ type: "SET_TAB", tab: "acc" });
  };

  const onMpesaDisabled = () => {
    toast(
      liveCatalog
        ? homeCopy("cartPayMpesaSoon", lang)
        : homeCopy("cartPayMpesaLocked", lang),
    );
  };

  const formValid =
    Object.keys(validateCheckoutFields(address, phone, lang, liveCatalog))
      .length === 0;

  const canPlace =
    ids.length > 0 &&
    !outside &&
    !placing &&
    (!liveCatalog || (Boolean(user) && formValid));

  const ordersCount = state.orders.length;
  const signedOutLive = liveCatalog && authReady && !user;

  const trackingOrder = useMemo(() => {
    if (trackingId == null) return null;
    return state.orders.find((o) => o.id === trackingId) ?? null;
  }, [trackingId, state.orders]);

  const onSegKeyDown = (e: KeyboardEvent) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const next: CartSegment = segment === "cart" ? "orders" : "cart";
    setSegment(next);
    (next === "cart" ? segCartRef : segOrdersRef).current?.focus();
  };

  const checkoutFieldDescribe = useMemo(() => {
    const ids: string[] = [];
    if (fieldErrors.address) ids.push("checkout-address-err");
    if (fieldErrors.phone) ids.push("checkout-phone-err");
    return ids.length ? ids.join(" ") : undefined;
  }, [fieldErrors.address, fieldErrors.phone]);

  const primaryEnabled = signedOutLive || canPlace;
  const primaryLabel = placing
    ? homeCopy("cartPlacing", lang)
    : signedOutLive
      ? homeCopy("cartSignInPlace", lang)
      : homeCopy("cartPlaceOrder", lang);

  const onCheckoutPrimary = () => {
    if (signedOutLive) {
      onSignIn();
      return;
    }
    if (liveCatalog && user && !formValid) {
      const errs = validateCheckoutFields(address, phone, lang, true);
      setFieldErrors(errs);
      return;
    }
    onPlaceOrder();
  };

  return (
    <div className="cart-view">
      <div
        className="cart-seg"
        role="tablist"
        aria-label="Cart views"
        onKeyDown={onSegKeyDown}
      >
        <button
          ref={segCartRef}
          type="button"
          role="tab"
          id="cart-seg-cart"
          aria-controls="cart-seg-panel"
          aria-selected={segment === "cart"}
          tabIndex={segment === "cart" ? 0 : -1}
          className="cart-seg__item"
          onClick={() => setSegment("cart")}
        >
          {homeCopy("cartSegmentCart", lang)}
        </button>
        <button
          ref={segOrdersRef}
          type="button"
          role="tab"
          id="cart-seg-orders"
          aria-controls="cart-seg-panel"
          aria-selected={segment === "orders"}
          tabIndex={segment === "orders" ? 0 : -1}
          className="cart-seg__item"
          onClick={() => setSegment("orders")}
        >
          {homeCopy("cartSegmentOrders", lang)}
          {ordersCount > 0 ? (
            <span className="cart-seg__count" aria-hidden>
              {ordersCount}
            </span>
          ) : null}
          {ordersCount > 0 ? (
            <span className="sr-only">{`${ordersCount} orders`}</span>
          ) : null}
        </button>
      </div>

      <div
        id="cart-seg-panel"
        role="tabpanel"
        aria-labelledby={segment === "cart" ? "cart-seg-cart" : "cart-seg-orders"}
      >
      {segment === "orders" ? (
        trackingOrder ? (
          <OrderTrackView
            lang={lang}
            order={trackingOrder}
            onBack={() => setTrackingId(null)}
            onToast={toast}
            dispatch={dispatch}
          />
        ) : placedSuccess ? (
          <OrderPlacedSuccess
            lang={lang}
            order={placedSuccess}
            onToast={toast}
            onTrack={() => {
              setPlacedSuccess(null);
              setTrackingId(placedSuccess.id);
            }}
            onContinue={() => {
              setPlacedSuccess(null);
              dispatch({ type: "SET_TAB", tab: "cat" });
            }}
          />
        ) : (
          <CartOrdersList
            lang={lang}
            orders={state.orders}
            dispatch={dispatch}
            onTrack={(id) => setTrackingId(id)}
            onToast={toast}
          />
        )
      ) : !ids.length ? (
        <div className="cart-empty" role="status">
          <span className="cart-empty-icon cart-empty-icon--cart" aria-hidden>
            <IconShoppingCart size={28} />
          </span>
          <h2 className="cart-empty-title">{homeCopy("cartEmptyTitle", lang)}</h2>
          <p className="m">{homeCopy("cartEmptyBody", lang)}</p>
          <button
            type="button"
            className="btn a cart-empty-cta"
            onClick={() => dispatch({ type: "SET_TAB", tab: "cat" })}
          >
            {homeCopy("cartStartShopping", lang)}
          </button>
          <CartPromoRow lang={lang} />
        </div>
      ) : (
        <>
          <section className="cart-section" aria-labelledby="cart-items-heading">
            <h2 id="cart-items-heading" className="cart-section-title">
              {homeCopy("cartSectionItems", lang)}
            </h2>
            {ids.map((id) => {
              const item = itemById(id);
              if (!item) {
                return (
                  <CartItemMissing
                    key={id}
                    id={id}
                    lang={lang}
                    dispatch={dispatch}
                  />
                );
              }
              return (
                <CartItemRow
                  key={id}
                  item={item}
                  qty={state.cart[id] ?? 0}
                  lang={lang}
                  dispatch={dispatch}
                  onRemoved={onRemoved}
                />
              );
            })}
          </section>

          <CartDeliveryForm
            lang={lang}
            address={address}
            phone={phone}
            errors={fieldErrors}
            savedHint={savedHint}
            onAddress={setAddress}
            onPhone={setPhone}
            onBlurAddress={onBlurAddress}
            onBlurPhone={onBlurPhone}
            onClearSaved={clearSaved}
          />

          <CartPaymentOptions
            lang={lang}
            pay={pay}
            mpesaDisabled={mpesaDisabled}
            mpesaReason={mpesaReason}
            onSelect={(p) => dispatch({ type: "SET_PAY", pay: p })}
            onDisabledMpesa={onMpesaDisabled}
          />

          {outside ? (
            <p className="cart-outside err" role="alert">
              {homeCopy("cartOutsideZone", lang)}
            </p>
          ) : null}

          <CartSummary
            lang={lang}
            area={state.area}
            subtotal={sub}
            fee={fee}
            promo={promo}
            onZoneClick={() => setZoneOpen(true)}
          />

          <div
            className="cart-checkout-bar"
            role="region"
            aria-label={homeCopy("cartPlaceOrder", lang)}
          >
            <div className="cart-checkout-total">
              <span className="m">{homeCopy("cartTotal", lang)}</span>
              <span className="cart-checkout-total-val">{kes(displayTotal)}</span>
            </div>
            <button
              type="button"
              className="btn cart-checkout-cta"
              disabled={!primaryEnabled}
              aria-busy={placing || undefined}
              aria-describedby={
                !primaryEnabled && checkoutFieldDescribe
                  ? checkoutFieldDescribe
                  : undefined
              }
              onClick={onCheckoutPrimary}
            >
              {primaryLabel}
            </button>
          </div>
        </>
      )}
      </div>

      <ZoneSheet
        open={zoneOpen}
        area={state.area}
        lang={lang}
        onClose={() => setZoneOpen(false)}
        onSelect={(zone) => dispatch({ type: "SET_AREA", area: zone })}
      />

      {undo ? (
        <div className="cart-undo toast cart-undo--visible" role="status">
          <span>{homeCopy("cartRemoved", lang)}</span>
          <button type="button" className="cart-undo-btn" onClick={undoRemove}>
            {homeCopy("cartUndo", lang)}
          </button>
        </div>
      ) : null}
    </div>
  );
}