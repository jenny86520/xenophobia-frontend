import { memberTabHref, parseMemberTab, pointsTabHref } from "./member-tabs";

describe("parseMemberTab", () => {
  it("reads a known tab and falls back to the profile", () => {
    expect(parseMemberTab("videos")).toBe("videos");
    expect(parseMemberTab("parties")).toBe("parties");
    // Friends moved to the sidebar every page has; the old tab is unknown now.
    expect(parseMemberTab("friends")).toBe("profile");
    expect(parseMemberTab("points")).toBe("points");
    expect(parseMemberTab(undefined)).toBe("profile");
    expect(parseMemberTab("abc")).toBe("profile");
    expect(parseMemberTab(["videos", "parties"])).toBe("profile");
  });
});

describe("memberTabHref", () => {
  it("keeps the default tab on plain /member", () => {
    expect(memberTabHref("profile")).toBe("/member");
    expect(memberTabHref("parties")).toBe("/member?tab=parties");
    expect(memberTabHref("videos")).toBe("/member?tab=videos");
    expect(memberTabHref("points")).toBe("/member?tab=points");
  });
});

describe("pointsTabHref", () => {
  it("leaves the defaults out", () => {
    expect(pointsTabHref({})).toBe(memberTabHref("points"));
    expect(pointsTabHref({ page: 1 })).toBe(memberTabHref("points"));
  });

  it("keeps the ledger page and the stamp card together", () => {
    expect(pointsTabHref({ page: 3 })).toBe("/member?tab=points&page=3");
    expect(pointsTabHref({ card: 2 })).toBe("/member?tab=points&card=2");
    expect(pointsTabHref({ page: 3, card: 2 })).toBe("/member?tab=points&page=3&card=2");
  });

  it("keeps card 1, which is not always the default card", () => {
    expect(pointsTabHref({ page: 1, card: 1 })).toBe("/member?tab=points&card=1");
  });
});
