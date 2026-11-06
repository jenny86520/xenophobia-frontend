import { memberTabHref, parseMemberTab } from "./member-tabs";

describe("parseMemberTab", () => {
  it("reads a known tab and falls back to the profile", () => {
    expect(parseMemberTab("videos")).toBe("videos");
    expect(parseMemberTab("parties")).toBe("parties");
    expect(parseMemberTab("friends")).toBe("friends");
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
