import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ApiError,
  apiFetch,
  refreshAccessToken,
} from "@/lib/nakuru/api";
import { clearAccessToken, setAccessToken } from "@/lib/nakuru/auth";

const jwt =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiY3VzdG9tZXIifQ.sig";

describe("apiFetch", () => {
  beforeEach(() => {
    clearAccessToken();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends nakuruhub header and bearer token", async () => {
    setAccessToken(jwt);
    const mock = vi.mocked(fetch);
    mock.mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    );

    await apiFetch("/api/me");

    expect(mock).toHaveBeenCalledOnce();
    const [, init] = mock.mock.calls[0]!;
    const headers = init?.headers as Headers;
    expect(headers.get("X-Requested-With")).toBe("nakuruhub");
    expect(headers.get("Authorization")).toBe(`Bearer ${jwt}`);
  });

  it("refreshes once on 401 and retries", async () => {
    setAccessToken("stale");
    const mock = vi.mocked(fetch);
    const fresh =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiY3VzdG9tZXIifQ.fresh";

    mock
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: "unauthorized" }), {
          status: 401,
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ access: fresh }), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: "u1", role: "customer" }), {
          status: 200,
        }),
      );

    const data = await apiFetch<{ id: string }>("/api/me");
    expect(data.id).toBe("u1");
    expect(mock).toHaveBeenCalledTimes(3);
    expect(mock.mock.calls[1]![0]).toBe("/api/auth/refresh");
  });

  it("throws ApiError when refresh fails", async () => {
    setAccessToken("stale");
    const mock = vi.mocked(fetch);
    mock
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: "unauthorized" }), {
          status: 401,
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: "unauthorized" }), {
          status: 401,
        }),
      );

    await expect(apiFetch("/api/me")).rejects.toBeInstanceOf(ApiError);
  });
});

describe("refreshAccessToken", () => {
  beforeEach(() => {
    clearAccessToken();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("stores access token from cookie refresh", async () => {
    const mock = vi.mocked(fetch);
    mock.mockResolvedValueOnce(
      new Response(JSON.stringify({ access: jwt }), { status: 200 }),
    );

    const tok = await refreshAccessToken();
    expect(tok).toBe(jwt);
    expect(mock.mock.calls[0]![1]?.credentials).toBe("include");
  });
});