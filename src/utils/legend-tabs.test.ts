import { boardsIn, legendTabHref, parseLegendTab, tabOf, visibleTabs } from "./legend-tabs";

const boards = [{ code: "scrim-matches" }, { code: "party-attendance" }, { code: "scrim-rating" }];

describe("legend tabs", () => {
  it("defaults to 總排行 for a missing, unknown or empty tab", () => {
    expect(parseLegendTab(undefined, boards)).toBe("overall");
    expect(parseLegendTab("abc", boards)).toBe("overall");
    expect(parseLegendTab(["scrim"], boards)).toBe("overall");
    // A known tab with no boards is not shown, so it is not chosen either.
    expect(parseLegendTab("points", boards)).toBe("overall");
    expect(parseLegendTab("scrim", boards)).toBe("scrim");
  });

  it("puts boards the site does not know under 其他", () => {
    expect(tabOf("scrim-cancelled")).toBe("scrim");
    expect(tabOf("checkin-streak")).toBe("points");
    expect(tabOf("brand-new")).toBe("other");
  });

  it("shows only tabs with boards, 總排行 always first", () => {
    expect(visibleTabs(boards)).toEqual(["overall", "party", "scrim"]);
    expect(visibleTabs([])).toEqual(["overall"]);
    expect(visibleTabs([...boards, { code: "brand-new" }])).toEqual(["overall", "party", "scrim", "other"]);
  });

  it("keeps the backend's order within a tab", () => {
    expect(boardsIn("scrim", boards).map((b) => b.code)).toEqual(["scrim-matches", "scrim-rating"]);
  });

  it("links tabs and boards", () => {
    expect(legendTabHref("overall")).toBe("/legends");
    expect(legendTabHref("scrim")).toBe("/legends?tab=scrim");
    expect(legendTabHref("party", "party-attendance")).toBe("/legends?tab=party#board-party-attendance");
  });
});
