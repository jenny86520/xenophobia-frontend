import { formatTimelineTime } from "./datetime";

describe("formatTimelineTime", () => {
  it("formats the stored wall-clock time as MM/DD HH:mm", () => {
    expect(formatTimelineTime("2026-09-30T18:30:00Z")).toBe("09/30 18:30");
    expect(formatTimelineTime("2026-01-05T07:05:00.000Z")).toBe("01/05 07:05");
  });

  it("returns the input unchanged when it is not a date", () => {
    expect(formatTimelineTime("TBD")).toBe("TBD");
  });
});
