import { videoTitle } from "./video-title";

describe("videoTitle", () => {
  it("puts the credited member's nickname after the title", () => {
    expect(videoTitle({ title: "殘局 1v3", memberNickname: "小明" })).toBe("殘局 1v3｜小明");
  });

  it("is just the title without a member", () => {
    expect(videoTitle({ title: "Ace clutch", memberNickname: null })).toBe("Ace clutch");
    expect(videoTitle({ title: "Ace clutch" })).toBe("Ace clutch");
  });
});
