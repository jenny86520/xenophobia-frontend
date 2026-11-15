import { isSitePath } from "./site-path";

describe("isSitePath", () => {
  it("accepts paths on this site, with a query or a fragment", () => {
    for (const path of ["/", "/shop", "/shop#shelf-tasks", "/news/abc-123", "/news?category=news"]) {
      expect([path, isSitePath(path)]).toEqual([path, true]);
    }
  });

  it("refuses other hosts and anything a browser could read as one", () => {
    for (const value of [
      "https://evil.example",
      "//evil.example",
      "/\\evil.example",
      "/a\\b",
      "shop",
      "",
      "/a b",
      "/a\tb",
      "/a\nb",
      "javascript:alert(1)",
      null,
      undefined,
    ]) {
      expect([value, isSitePath(value)]).toEqual([value, false]);
    }
  });

  it("refuses paths longer than 200 characters", () => {
    expect(isSitePath(`/${"a".repeat(199)}`)).toBe(true);
    expect(isSitePath(`/${"a".repeat(200)}`)).toBe(false);
  });
});
