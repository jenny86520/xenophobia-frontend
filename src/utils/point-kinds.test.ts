import { formatPointAmount, pointEntryLabel, pointKindLabel } from "./point-kinds";

describe("pointKindLabel", () => {
  it("names the attendance kinds", () => {
    expect(pointKindLabel("party_attend")).toBe("派對到場");
    expect(pointKindLabel("sub_party_attend")).toBe("子派對到場");
    expect(pointKindLabel("attendance_revoked")).toBe("取消到場");
  });

  it("names the scrim and video kinds", () => {
    expect(pointKindLabel("scrim_play")).toBe("參加內戰");
    expect(pointKindLabel("video_accepted")).toBe("投稿影片入選");
    expect(pointKindLabel("quest_reward")).toBe("新手任務");
  });

  it("names the shop kinds instead of showing their codes", () => {
    expect(pointKindLabel("cosmetic_purchase")).toBe("購買外觀");
    expect(pointKindLabel("ice_delete_refund")).toBe("刪除冰炫風退回");
  });

  it("shows an unknown kind as its code", () => {
    expect(pointKindLabel("something_new")).toBe("something_new");
  });
});

describe("pointEntryLabel", () => {
  it("adds what a purchase bought", () => {
    expect(pointEntryLabel({ kind: "cosmetic_purchase", detail: "聖誕杯" })).toBe("購買外觀・聖誕杯");
  });

  it("is just the kind without a detail", () => {
    expect(pointEntryLabel({ kind: "cosmetic_purchase", detail: null })).toBe("購買外觀");
    expect(pointEntryLabel({ kind: "checkin" })).toBe("每日簽到");
  });
});

describe("formatPointAmount", () => {
  it("signs both ways with a real minus sign", () => {
    expect(formatPointAmount(3)).toBe("+3");
    expect(formatPointAmount(-3)).toBe("−3");
  });
});
