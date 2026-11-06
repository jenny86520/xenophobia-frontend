import { ratingBreakdown, signedPoints } from "./rating";

describe("signedPoints", () => {
  it("signs every value, with a real minus sign", () => {
    expect(signedPoints(28)).toBe("+28");
    expect(signedPoints(-25)).toBe("−25");
    expect(signedPoints(0)).toBe("±0");
  });
});

describe("ratingBreakdown", () => {
  it("names the team and the personal part", () => {
    expect(ratingBreakdown({ teamPart: 25, personalPart: 3, note: null })).toBe("勝負 +25・個人 +3");
    expect(ratingBreakdown({ teamPart: -18, personalPart: -4, note: null })).toBe("勝負 −18・個人 −4");
  });

  it("says when there was nothing to compare", () => {
    expect(ratingBreakdown({ teamPart: 25, personalPart: 0, note: "no-stats" })).toBe("勝負 +25・沒有個人數據");
  });
});
