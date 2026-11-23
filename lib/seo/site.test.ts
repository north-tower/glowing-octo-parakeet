import { describe, expect, it } from "vitest";
import { absoluteUrl, siteJsonLd, SITE_URL } from "./site";

describe("siteJsonLd", () => {
  it("includes SearchAction targeting /app?q=", () => {
    const graph = siteJsonLd()["@graph"] as Record<string, unknown>[];
    const web = graph.find((n) => n["@type"] === "WebSite") as {
      potentialAction?: { target?: { urlTemplate?: string } };
    };
    expect(web?.potentialAction?.target?.urlTemplate).toBe(
      `${absoluteUrl("/app")}?q={search_term_string}`,
    );
  });

  it("uses configured site URL", () => {
    expect(SITE_URL).toMatch(/^https?:\/\//);
  });
});