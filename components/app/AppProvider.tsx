"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { readDetailNavTab } from "@/lib/nakuru/detail-nav-tab";
import { persistAppMode, wantsSellingEntry } from "@/lib/nakuru/app-mode";
import {
  createInitialState,
  nakuruReducer,
  type NakuruAction,
} from "@/lib/nakuru/reducer";
import type { NakuruState, TabId } from "@/lib/nakuru/types";
import { AppAuthProvider } from "@/components/app/AppAuthProvider";
import { AssistantUiProvider } from "@/components/app/assistant/AssistantUiProvider";
import { InstallProvider } from "@/components/app/pwa/InstallProvider";
import { requestInstallRetrigger } from "@/lib/nakuru/pwa-engage";

type NakuruContextValue = {
  state: NakuruState;
  dispatch: (action: NakuruAction) => void;
  toast: (message: string) => void;
};

const NakuruContext = createContext<NakuruContextValue | null>(null);

const VALID_TABS: TabId[] = ["home", "cat", "msg", "cart", "acc"];

type UrlNavSlice = {
  tabParam: string | null;
  sideParam: string;
  qParam: string;
  catParam: string;
  onProductDetail: boolean;
};

function applyUrlNavToState(prev: NakuruState, url: UrlNavSlice): NakuruState {
  let next: NakuruState = {
    ...prev,
    ...(url.qParam ? { q: url.qParam } : {}),
    ...(url.catParam ? { cat: url.catParam } : {}),
  };

  if (url.onProductDetail) {
    return { ...next, tab: readDetailNavTab() };
  }

  if (url.tabParam && VALID_TABS.includes(url.tabParam as TabId)) {
    const tab = url.tabParam as TabId;
    next = { ...next, tab };
    if (tab === "cat" && url.sideParam) {
      next = { ...next, side: url.sideParam, cat: "all" };
    }
  }

  return next;
}

function urlNavMatches(a: NakuruState, b: NakuruState): boolean {
  return (
    a.tab === b.tab &&
    a.side === b.side &&
    a.cat === b.cat &&
    a.q === b.q
  );
}

export function useNakuruApp(): NakuruContextValue {
  const ctx = useContext(NakuruContext);
  if (!ctx) {
    throw new Error("useNakuruApp must be used within AppProvider");
  }
  return ctx;
}

type ProviderProps = {
  children: ReactNode;
};

export function AppProvider({ children }: ProviderProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const onProductDetail = pathname?.startsWith("/app/p/") ?? false;
  const vendorEntry = wantsSellingEntry(
    searchParams.get("start"),
    searchParams.has("vendor"),
  );

  const tabParam = searchParams.get("tab");
  const sideParam = searchParams.get("side") ?? "";
  const qParam = searchParams.get("q") ?? "";
  const catParam = searchParams.get("cat") ?? "";

  const urlNav: UrlNavSlice = {
    tabParam,
    sideParam,
    qParam,
    catParam,
    onProductDetail,
  };

  const [state, setState] = useState(() => {
    if (vendorEntry) persistAppMode("selling");
    const base = createInitialState(vendorEntry);
    return applyUrlNavToState(base, urlNav);
  });

  useEffect(() => {
    setState((prev) => {
      const next = applyUrlNavToState(prev, urlNav);
      return urlNavMatches(prev, next) ? prev : next;
    });
  }, [tabParam, sideParam, qParam, catParam, onProductDetail]);

  const [toastText, setToastText] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toast = useCallback((message: string) => {
    setToastText(message);
    setToastVisible(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastVisible(false), 2800);
  }, []);

  const dispatch = useCallback(
    (action: NakuruAction) => {
      setState((prev) => {
        const result = nakuruReducer(prev, action);
        if (result.toast) {
          queueMicrotask(() => toast(result.toast!));
          if (
            result.toast === "Added to cart" ||
            result.toast === "Order placed. Track it below."
          ) {
            requestInstallRetrigger();
            queueMicrotask(() => window.dispatchEvent(new Event("nh:engage")));
          }
        }
        return result.state;
      });
    },
    [toast],
  );

  const value = useMemo(
    () => ({ state, dispatch, toast }),
    [state, dispatch, toast],
  );

  return (
    <AppAuthProvider>
      <NakuruContext.Provider value={value}>
        <InstallProvider>
          <AssistantUiProvider>{children}</AssistantUiProvider>
        </InstallProvider>
        <div
          id="toast"
          className="toast"
          role="status"
          aria-live="polite"
          hidden={!toastVisible}
        >
          {toastText}
        </div>
      </NakuruContext.Provider>
    </AppAuthProvider>
  );
}