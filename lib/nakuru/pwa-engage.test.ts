import { afterEach, describe, expect, it } from "vitest";
import { readInstalled } from "./pwa-engage";

describe("pwa-engage storage", () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, "localStorage");

  afterEach(() => {
    if (original) {
      Object.defineProperty(globalThis, "localStorage", original);
    }
  });

  it("readInstalled returns false when localStorage is unavailable (SSR)", () => {
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      get() {
        throw new ReferenceError("localStorage is not defined");
      },
    });
    expect(readInstalled()).toBe(false);
  });
});
