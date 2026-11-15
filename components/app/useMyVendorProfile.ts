"use client";

import { useAuth } from "@/components/app/AppAuthProvider";
import { useNakuruApp } from "@/components/app/AppProvider";
import { apiFetch, ApiError } from "@/lib/nakuru/api";
import { useLiveApi } from "@/lib/nakuru/api-mode";
import {
  pickPrimaryVendor,
  type ApiVendorRow,
  type VendorAccountSummary,
} from "@/lib/nakuru/vendor-profile";
import { useCallback, useEffect, useState } from "react";

export function useMyVendorProfile(): {
  profile: VendorAccountSummary | null;
  loading: boolean;
} {
  const liveApi = useLiveApi();
  const { user, ready } = useAuth();
  const { state } = useNakuruApp();
  const [rows, setRows] = useState<ApiVendorRow[] | null>(null);

  const loadMine = useCallback(async () => {
    if (!user) {
      setRows([]);
      return;
    }
    try {
      const data = await apiFetch<ApiVendorRow[]>("/api/vendors/mine");
      setRows(data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setRows([]);
        return;
      }
      setRows([]);
    }
  }, [user]);

  useEffect(() => {
    if (!liveApi) return;
    if (!ready) return;
    void loadMine();
  }, [liveApi, ready, loadMine]);

  if (!liveApi) {
    const me = state.me;
    if (!me) return { profile: null, loading: false };
    return {
      profile: {
        name: me.n,
        status:
          me.st === "Approved"
            ? "approved"
            : me.st === "Rejected"
              ? "rejected"
              : "pending",
        verified: Boolean(me.ver),
      },
      loading: false,
    };
  }

  if (!ready || (user && rows === null)) {
    return { profile: null, loading: Boolean(user) };
  }

  const primary = rows ? pickPrimaryVendor(rows) : null;
  if (!primary) return { profile: null, loading: false };

  return {
    profile: {
      name: primary.name,
      status: primary.status,
      verified: primary.verified,
    },
    loading: false,
  };
}