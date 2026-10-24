import { memberTabHref, parseMemberTab } from "./member-tabs";

describe("parseMemberTab", () => {
  it("reads a known tab and falls back to the joined parties", () => {
    expect(parseMemberTab("videos")).toBe("videos");
    expect(parseMemberTab("nickname")).toBe("nickname");
    expect(parseMemberTab(undefined)).toBe("parties");
    expect(parseMemberTab("abc")).toBe("parties");
    expect(parseMemberTab(["videos", "nickname"])).toBe("parties");
  });
});

describe("memberTabHref", () => {
  it("keeps the default tab on plain /member", () => {
    expect(memberTabHref("parties")).toBe("/member");
    expect(memberTabHref("videos")).toBe("/member?tab=videos");
  });
});
