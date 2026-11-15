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
import { useSearchParams } from "next/navigation";
import {
  createInitialState,
  nakuruReducer,
  type NakuruAction,
} from "@/lib/nakuru/reducer";
import type { NakuruState } from "@/lib/nakuru/types";

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
  const vendorEntry =
    searchParams.get("start") === "vendor" || searchParams.has("vendor");

  const [state, setState] = useState(() => createInitialState(vendorEntry));

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
    <NakuruContext.Provider value={value}>
      {children}
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
  );
}