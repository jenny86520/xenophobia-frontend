import { formatPointAmount, pointKindLabel } from "./point-kinds";

describe("pointKindLabel", () => {
  it("names the attendance kinds", () => {
    expect(pointKindLabel("party_attend")).toBe("派對到場");
    expect(pointKindLabel("sub_party_attend")).toBe("子派對到場");
    expect(pointKindLabel("attendance_revoked")).toBe("取消到場");
  });

  it("shows an unknown kind as its code", () => {
    expect(pointKindLabel("something_new")).toBe("something_new");
  });
});

describe("formatPointAmount", () => {
  it("signs both ways with a real minus sign", () => {
    expect(formatPointAmount(3)).toBe("+3");
    expect(formatPointAmount(-3)).toBe("−3");
  });
});
