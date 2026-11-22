import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearAppMode,
  persistAppMode,
  readAppMode,
  wantsSellingEntry,
} from "./app-mode";

function mockSessionStorage() {
  const bag = new Map<string, string>();
  vi.stubGlobal("sessionStorage", {
    getItem: (key: string) => bag.get(key) ?? null,
    setItem: (key: string, value: string) => {
      bag.set(key, value);
    },
    removeItem: (key: string) => {
      bag.delete(key);
    },
    clear: () => bag.clear(),
  });
}

describe("wantsSellingEntry", () => {
  it("defaults to shopping", () => {
    expect(wantsSellingEntry(null, false)).toBe(false);
    expect(wantsSellingEntry("shop", false)).toBe(false);
  });

  it("detects landing sell entry", () => {
    expect(wantsSellingEntry("vendor", false)).toBe(true);
    expect(wantsSellingEntry(null, true)).toBe(true);
  });
});

describe("app mode storage", () => {
  beforeEach(() => {
    mockSessionStorage();
  });

  it("defaults to shopping", () => {
    expect(readAppMode()).toBe("shopping");
  });

  it("persists selling and clears to shopping", () => {
    persistAppMode("selling");
    expect(readAppMode()).toBe("selling");
    clearAppMode();
    expect(readAppMode()).toBe("shopping");
  });
});
