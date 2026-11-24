"use client";

import {
  detectNakuruZoneFromDevice,
  GeoError,
} from "@/lib/nakuru/geo";
import { useCallback, useState } from "react";

export function geoErrorMessage(code: GeoError["code"], lang: "en" | "sw"): string {
  const en: Record<GeoError["code"], string> = {
    unsupported: "This browser cannot read your location.",
    denied: "Location permission was blocked. Allow it or pick an area manually.",
    unavailable: "Could not read your location. Try again or pick manually.",
    timeout: "Location took too long. Try again or pick manually.",
    outside_nakuru:
      "You look outside Nakuru delivery areas. Pick the closest area manually.",
  };
  const sw: Record<GeoError["code"], string> = {
    unsupported: "Kivinjari hiki hakiwezi kusoma eneo lako.",
    denied: "Ruhusa ya eneo imekataliwa. Ruhusu au chagua eneo kwa mkono.",
    unavailable: "Hatukuweza kusoma eneo lako. Jaribu tena au chagua kwa mkono.",
    timeout: "Eneo limeshukuru muda. Jaribu tena au chagua kwa mkono.",
    outside_nakuru:
      "Unaonekana uko nje ya maeneo ya Nakuru. Chagua eneo karibu kwa mkono.",
  };
  return (lang === "sw" ? sw : en)[code];
}

export function useDetectNakuruZone(
  toast: (msg: string) => void,
  lang: "en" | "sw",
) {
  const [busy, setBusy] = useState(false);

  const detect = useCallback(async (): Promise<string | null> => {
    if (busy) return null;
    setBusy(true);
    try {
      const zone = await detectNakuruZoneFromDevice();
      toast(
        lang === "sw"
          ? `Eneo lako: ${zone}.`
          : `Detected shop area: ${zone}.`,
      );
      return zone;
    } catch (err) {
      if (err instanceof GeoError) {
        toast(geoErrorMessage(err.code, lang));
      } else {
        toast(
          lang === "sw"
            ? "Hatukuweza kusoma eneo lako."
            : "Could not detect your location.",
        );
      }
      return null;
    } finally {
      setBusy(false);
    }
  }, [busy, lang, toast]);

  return { detect, busy };
}