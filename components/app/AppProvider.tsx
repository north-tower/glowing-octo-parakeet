"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { readDetailNavTab } from "@/lib/nakuru/detail-nav-tab";
import {
  createInitialState,
  nakuruReducer,
  type NakuruAction,
} from "@/lib/nakuru/reducer";
import type { NakuruState, TabId } from "@/lib/nakuru/types";
import { AppAuthProvider } from "@/components/app/AppAuthProvider";
import { InstallProvider } from "@/components/app/pwa/InstallProvider";
import { requestInstallRetrigger } from "@/lib/nakuru/pwa-engage";

type NakuruContextValue = {
  state: NakuruState;
  dispatch: (action: NakuruAction) => void;
  toast: (message: string) => void;
};

const NakuruContext = createContext<NakuruContextValue | null>(null);

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
  const vendorEntry =
    searchParams.get("start") === "vendor" || searchParams.has("vendor");

  const tabParam = searchParams.get("tab");
  const validTabs: TabId[] = ["home", "cat", "msg", "cart", "acc"];

  const [state, setState] = useState(() => {
    const base = createInitialState(vendorEntry);
    if (onProductDetail) {
      return { ...base, tab: readDetailNavTab() };
    }
    if (tabParam && validTabs.includes(tabParam as TabId)) {
      return { ...base, tab: tabParam as TabId };
    }
    return base;
  });

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
        <InstallProvider>{children}</InstallProvider>
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