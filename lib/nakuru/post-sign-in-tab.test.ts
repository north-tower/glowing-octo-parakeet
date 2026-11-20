import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  consumePostSignInReturn,
  requestPostSignInReturn,
} from "./post-sign-in-tab";

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

describe("post sign-in return", () => {
  beforeEach(() => {
    mockSessionStorage();
  });

  it("stores tab and safe in-app path", () => {
    requestPostSignInReturn({
      tab: "cart",
      path: "/app/p/abc?x=1",
    });
    expect(consumePostSignInReturn()).toEqual({
      tab: "cart",
      path: "/app/p/abc?x=1",
    });
  });

  it("rejects unsafe paths", () => {
    requestPostSignInReturn({ tab: "home", path: "//evil.test" });
    expect(consumePostSignInReturn()).toEqual({ tab: "home", path: null });

    requestPostSignInReturn({ tab: "cart", path: "/staff" });
    expect(consumePostSignInReturn()).toEqual({ tab: "cart", path: null });
  });
});