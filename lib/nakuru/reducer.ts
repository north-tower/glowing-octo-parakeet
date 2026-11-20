import { ZONES, DEFAULT_AREA } from "@/lib/nakuru/data/zones";
import {
  MAX_CART_QTY,
  PHONE_REGEX,
  SOON,
  TOPC,
} from "@/lib/nakuru/data/constants";
import { itemById } from "@/lib/nakuru/data/items";
import { listingModeOf } from "@/lib/nakuru/listing-mode";
import { isOutsideArea } from "@/lib/nakuru/area";
import type {
  AccView,
  CategoryId,
  NakuruState,
  Order,
  OrderItemSnap,
  PayMethod,
  TabId,
} from "@/lib/nakuru/types";

export function createInitialState(
  vendorEntry?: boolean,
): NakuruState {
  const base: NakuruState = {
    tab: "home",
    cat: "all",
    q: "",
    side: "feat",
    acc: null,
    cart: {},
    pay: "cod",
    orders: [],
    area: DEFAULT_AREA,
    apps: [
      { n: "Zawadi Agents", cats: ["property"], st: "Pending", ver: 0 },
      { n: "Kicks254", cats: ["shop"], st: "Pending", ver: 0 },
    ],
    me: null,
    vc: ["shop"],
    vn: "",
    vp: "",
    photo: "",
  };
  if (vendorEntry) {
    return { ...base, tab: "acc", acc: "vendor" };
  }
  return base;
}

export type NakuruAction =
  | { type: "SET_TAB"; tab: TabId }
  | { type: "SET_CAT"; cat: string }
  | { type: "SET_SIDE"; side: string }
  | { type: "SET_Q"; q: string }
  | { type: "SET_AREA"; area: string }
  | { type: "SET_PAY"; pay: PayMethod }
  | { type: "SET_ACC"; acc: AccView | null }
  | { type: "SELECT_TOPC"; index: number }
  | { type: "QUOTE_HOME" }
  | { type: "SLIDE_SHOP" }
  | { type: "SLIDE_VENDOR" }
  | { type: "SIGNIN" }
  | { type: "ACCOUNT_ROW"; id: string }
  | { type: "ITEM_ACT"; id: number | string }
  | { type: "CART_INC"; id: string }
  | { type: "CART_DEC"; id: string }
  | { type: "PLACE_ORDER" }
  | { type: "CLEAR_CART" }
  | { type: "SET_ORDERS"; orders: Order[] }
  | { type: "APPEND_ORDERS"; orders: Order[] }
  | { type: "ADV_ORDER"; id: number | string }
  | { type: "VC_TOGGLE"; cat: CategoryId }
  | { type: "SET_VN"; vn: string }
  | { type: "SET_VP"; vp: string }
  | { type: "SET_PHOTO"; photo: string }
  | { type: "REG_VENDOR" }
  | { type: "APP_APPROVE"; index: number }
  | { type: "APP_VERIFY"; index: number };

export type ActionResult = {
  state: NakuruState;
  toast?: string;
  /** Cart badge-only chrome refresh not needed in React; kept for parity messages */
};

function cartAllVerified(
  cart: Record<string, number>,
): boolean {
  return Object.keys(cart).every((id) => {
    const item = itemById(id);
    return item?.v === 1;
  });
}

export function nakuruReducer(
  state: NakuruState,
  action: NakuruAction,
): ActionResult {
  switch (action.type) {
    case "SET_TAB": {
      const next: NakuruState = { ...state, tab: action.tab };
      if (action.tab === "acc") next.acc = null;
      return { state: next };
    }
    case "SET_CAT":
      return {
        state: { ...state, cat: action.cat, q: "", tab: "home" },
      };
    case "SET_SIDE":
      return { state: { ...state, side: action.side } };
    case "SET_Q": {
      const q = action.q.slice(0, 80);
      let cat = state.cat;
      if (SOON[cat as CategoryId]) cat = "all";
      return { state: { ...state, q, cat, tab: "home" } };
    }
    case "SET_AREA":
      return { state: { ...state, area: action.area } };
    case "SET_PAY":
      return { state: { ...state, pay: action.pay } };
    case "SET_ACC":
      return { state: { ...state, acc: action.acc } };
    case "SELECT_TOPC": {
      const t = TOPC[action.index];
      if (!t) return { state };
      return {
        state: {
          ...state,
          cat: t[2],
          q: t[3],
          tab: "home",
        },
      };
    }
    case "QUOTE_HOME":
      return {
        state: { ...state, cat: "services", q: "", tab: "home" },
        toast: "Pick a service to request a quote",
      };
    case "SLIDE_SHOP":
      return {
        state: { ...state, cat: "shop", q: "", tab: "home" },
      };
    case "SLIDE_VENDOR":
      return {
        state: { ...state, tab: "acc", acc: "vendor" },
      };
    case "SIGNIN":
      return {
        state: { ...state, tab: "acc", acc: "vendor" },
      };
    case "ACCOUNT_ROW": {
      const id = action.id;
      if (id === "acc:saved") {
        return { state, toast: "Saved items are coming soon" };
      }
      if (id === "acc:help" || id === "toast") {
        return { state, toast: "Help is coming soon" };
      }
      const p = id.split(":");
      if (p[0] === "tab") {
        return { state: { ...state, tab: p[1] as TabId, acc: null } };
      }
      return { state: { ...state, acc: p[1] as AccView } };
    }
    case "ITEM_ACT": {
      const item = itemById(action.id);
      if (!item) return { state };
      const mode = listingModeOf(item);
      if (mode === "shop") {
        const key = String(action.id);
        const n = Math.min(
          MAX_CART_QTY,
          (state.cart[key] ?? 0) + 1,
        );
        return {
          state: { ...state, cart: { ...state.cart, [key]: n } },
          toast: "Added to cart",
        };
      }
      if (mode === "services") {
        return { state, toast: `Quote request sent to ${item.t}` };
      }
      return {
        state,
        toast: "Viewing request sent. Remember: view first, pay later.",
      };
    }
    case "CART_INC": {
      const cur = state.cart[action.id] ?? 0;
      if (cur >= MAX_CART_QTY) return { state };
      return {
        state: {
          ...state,
          cart: { ...state.cart, [action.id]: cur + 1 },
        },
      };
    }
    case "CART_DEC": {
      const cur = state.cart[action.id] ?? 0;
      const next = { ...state.cart };
      if (cur <= 1) delete next[action.id];
      else next[action.id] = cur - 1;
      return { state: { ...state, cart: next } };
    }
    case "CLEAR_CART":
      return { state: { ...state, cart: {} } };
    case "SET_ORDERS":
      return { state: { ...state, orders: action.orders } };
    case "APPEND_ORDERS":
      return {
        state: {
          ...state,
          orders: [...state.orders, ...action.orders],
        },
      };
    case "PLACE_ORDER": {
      const order = buildDemoPlaceOrder(state);
      if (!order) return { state };
      return {
        state: { ...state, orders: [...state.orders, order], cart: {} },
        toast: "Order placed. Track it below.",
      };
    }
    case "ADV_ORDER": {
      const orders = state.orders.map((o) => {
        if (o.live || o.id !== action.id || o.s >= 4) return o;
        return { ...o, s: o.s + 1 };
      });
      return { state: { ...state, orders } };
    }
    case "VC_TOGGLE": {
      const vc = [...state.vc];
      const x = vc.indexOf(action.cat);
      if (x > -1) vc.splice(x, 1);
      else vc.push(action.cat);
      return { state: { ...state, vc } };
    }
    case "SET_VN":
      return { state: { ...state, vn: action.vn } };
    case "SET_VP":
      return { state: { ...state, vp: action.vp } };
    case "SET_PHOTO":
      return { state: { ...state, photo: action.photo } };
    case "REG_VENDOR": {
      const nm = state.vn.trim().slice(0, 60);
      const ph = state.vp.replace(/[\s-]/g, "");
      if (!nm) return { state, toast: "Enter your name or business name" };
      if (ph && !PHONE_REGEX.test(ph)) {
        return {
          state,
          toast: "Enter a valid Kenyan phone, e.g. 0712 345 678",
        };
      }
      if (!state.vc.length) {
        return { state, toast: "Choose at least one category" };
      }
      const me = {
        n: nm,
        cats: state.vc.slice(),
        st: "Pending",
        ver: 0,
      };
      return {
        state: {
          ...state,
          me,
          apps: [me, ...state.apps],
        },
        toast: "Submitted. Admin will review it.",
      };
    }
    case "APP_APPROVE": {
      const apps = state.apps.map((a, k) =>
        k === action.index ? { ...a, st: "Approved" } : a,
      );
      let me = state.me;
      if (me && apps[action.index]?.n === me.n) {
        me = { ...me, st: "Approved" };
      }
      return { state: { ...state, apps, me } };
    }
    case "APP_VERIFY": {
      const apps = state.apps.map((a, k) =>
        k === action.index ? { ...a, ver: 1 } : a,
      );
      let me = state.me;
      if (me && state.apps[action.index]?.n === me.n) {
        me = { ...me, ver: 1 };
      }
      return { state: { ...state, apps, me } };
    }
    default:
      return { state };
  }
}

/** Demo checkout snapshot (same shape as `PLACE_ORDER` creates). */
export function buildDemoPlaceOrder(state: NakuruState): Order | null {
  const ids = Object.keys(state.cart);
  if (!ids.length || isOutsideArea(state.area)) return null;
  let subtotal = 0;
  let allV = true;
  const items: OrderItemSnap[] = [];
  let vendor: string | undefined;
  let vendorVerified = true;
  ids.forEach((id) => {
    const it = itemById(id);
    if (!it) return;
    const qty = state.cart[id] ?? 0;
    subtotal += it.p * qty;
    if (!it.v) allV = false;
    items.push({
      productId: it.id,
      title: it.t,
      unit: it.p,
      qty,
    });
    if (!vendor) {
      vendor = it.vn ?? it.s;
      vendorVerified = Boolean(it.v);
    }
  });
  const fee = ZONES[state.area] ?? 0;
  const total = subtotal + fee;
  const pay =
    state.pay === "mpesa" && allV ? "Paid by M-Pesa" : "Pay on delivery";
  const code = String(
    1000 + (crypto.getRandomValues(new Uint32Array(1))[0] % 9000),
  );
  return {
    id: 1001 + state.orders.length,
    total,
    pay,
    s: 0,
    code,
    items,
    vendor,
    vendorVerified,
    zone: state.area,
    fee,
    promoFreeDelivery: state.orders.length === 0,
    createdAt: new Date().toISOString(),
  };
}

export function cartCount(cart: Record<string, number>): number {
  return Object.keys(cart).reduce((a, k) => a + (cart[k] ?? 0), 0);
}

export function cartSubtotal(cart: Record<string, number>): number {
  return Object.keys(cart).reduce((a, id) => {
    const item = itemById(id);
    if (!item) return a;
    return a + item.p * (cart[id] ?? 0);
  }, 0);
}

export function effectivePay(
  state: NakuruState,
): PayMethod {
  const ids = Object.keys(state.cart);
  if (!ids.length) return state.pay;
  const allV = cartAllVerified(state.cart);
  if (!allV && state.pay === "mpesa") return "cod";
  return state.pay;
}