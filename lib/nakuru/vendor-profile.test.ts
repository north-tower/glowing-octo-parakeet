import { describe, expect, it } from "vitest";
import { accountMenuRows } from "./vendor-profile";

describe("accountMenuRows", () => {
  it("includes Become a seller when signed in with no shop", () => {
    const rows = accountMenuRows(null, true);
    const selling = rows.filter((r) => r.section === "selling");
    expect(selling).toHaveLength(1);
    expect(selling[0]).toMatchObject({
      actionId: "acc:vendor",
      labelKey: "accSell",
    });
    expect(selling[0]?.disabled).toBeFalsy();
  });

  it("lets pending sellers open status, not a disabled shop", () => {
    const rows = accountMenuRows(
      { name: "Kicks", status: "pending", verified: false },
      true,
    );
    const selling = rows.find((r) => r.section === "selling");
    expect(selling).toMatchObject({
      actionId: "acc:vendor",
      labelKey: "accApplicationStatus",
    });
    expect(selling?.disabled).toBeFalsy();
  });

  it("uses apply again when rejected", () => {
    const rows = accountMenuRows(
      { name: "Kicks", status: "rejected", verified: false },
      true,
    );
    expect(rows.find((r) => r.section === "selling")).toMatchObject({
      actionId: "acc:vendor",
      labelKey: "accApplyAgain",
    });
  });

  it("uses My shop when approved", () => {
    const rows = accountMenuRows(
      { name: "Kicks", status: "approved", verified: true },
      true,
    );
    expect(rows.find((r) => r.section === "selling")).toMatchObject({
      actionId: "acc:vendor",
      labelKey: "accMyShop",
    });
  });
});
