export const ZONES: Record<string, number> = {
  "Town/CBD": 100,
  Milimani: 150,
  "Section 58": 150,
  Lanet: 200,
  "Free Area": 200,
  "Outside Nakuru (e.g. Eldoret)": 0,
};

export const DEFAULT_AREA = "Town/CBD";

export const NAKURU_AREA_KEYS = Object.keys(ZONES).filter(
  (z) => !z.startsWith("Outside"),
) as [string, ...string[]];