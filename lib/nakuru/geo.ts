import { ZONES } from "@/lib/nakuru/data/zones";

/** Rough bounds for Nakuru town and nearby estates (same as order delivery checks). */
export const NAKURU_BOX = { s: -0.37, n: -0.24, w: 36.0, e: 36.16 };

/** Approximate center points for nearest-zone matching (WGS84). */
const ZONE_CENTROIDS: Record<string, { lat: number; lng: number }> = {
  "Town/CBD": { lat: -0.2833, lng: 36.0667 },
  Milimani: { lat: -0.292, lng: 36.078 },
  "Section 58": { lat: -0.308, lng: 36.095 },
  Lanet: { lat: -0.265, lng: 36.13 },
  "Free Area": { lat: -0.288, lng: 36.105 },
};

const NAKURU_ZONE_KEYS = Object.keys(ZONES).filter((z) => !z.startsWith("Outside"));

export type GeoErrorCode =
  | "unsupported"
  | "denied"
  | "unavailable"
  | "timeout"
  | "outside_nakuru";

export class GeoError extends Error {
  code: GeoErrorCode;

  constructor(code: GeoErrorCode) {
    super(code);
    this.code = code;
  }
}

export function inNakuruBox(lat: number, lng: number): boolean {
  return (
    lat >= NAKURU_BOX.s &&
    lat <= NAKURU_BOX.n &&
    lng >= NAKURU_BOX.w &&
    lng <= NAKURU_BOX.e
  );
}

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const r = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return r * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Picks the closest Nakuru delivery zone for GPS coordinates. */
export function nearestNakuruZone(lat: number, lng: number): string | null {
  if (!inNakuruBox(lat, lng)) return null;
  let best: { zone: string; km: number } | null = null;
  for (const zone of NAKURU_ZONE_KEYS) {
    const c = ZONE_CENTROIDS[zone];
    if (!c) continue;
    const km = haversineKm(lat, lng, c.lat, c.lng);
    if (!best || km < best.km) best = { zone, km };
  }
  return best?.zone ?? null;
}

export function readDeviceLocation(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new GeoError("unsupported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          reject(new GeoError("denied"));
        } else if (err.code === err.TIMEOUT) {
          reject(new GeoError("timeout"));
        } else {
          reject(new GeoError("unavailable"));
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15_000,
        maximumAge: 60_000,
      },
    );
  });
}

export async function detectNakuruZoneFromDevice(): Promise<string> {
  const { lat, lng } = await readDeviceLocation();
  const zone = nearestNakuruZone(lat, lng);
  if (!zone) throw new GeoError("outside_nakuru");
  return zone;
}