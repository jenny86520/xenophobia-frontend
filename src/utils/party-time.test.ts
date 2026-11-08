import { formatPartyTime, formatPartyTimeOfDay, formatSubPartyRange, subPartyTimeParts } from "./party-time";

const party = (startDate: string, startTime: string, endDate = "", endTime = "") => ({
  startDate,
  startTime,
  endDate,
  endTime,
});

describe("formatPartyTime", () => {
  it("shows the start, a same-day end as a time and another day in full", () => {
    expect(formatPartyTime(party("2026-11-01", "19:00"))).toBe("2026-11-01 19:00");
    expect(formatPartyTime(party("2026-11-01", "19:00", "2026-11-01", "23:00"))).toBe("2026-11-01 19:00 – 23:00");
    expect(formatPartyTime(party("2026-11-01", "22:00", "2026-11-02", "02:00"))).toBe(
      "2026-11-01 22:00 – 2026-11-02 02:00",
    );
  });

  it("says when the time or the whole start is not decided", () => {
    expect(formatPartyTime(party("2026-11-01", ""))).toBe("2026-11-01（時間待定）");
    expect(formatPartyTime(party("2026-11-01", "", "2026-11-03", ""))).toBe(
      "2026-11-01（時間待定） – 2026-11-03（時間待定）",
    );
    expect(formatPartyTime(party("", ""))).toBe("待定");
  });

  it("can say 待定 instead of 時間待定", () => {
    expect(formatPartyTime(party("2026-11-01", "", "2026-11-03", ""), "待定")).toBe(
      "2026-11-01（待定） – 2026-11-03（待定）",
    );
  });
});

describe("formatPartyTimeOfDay", () => {
  it("leaves the start date out", () => {
    expect(formatPartyTimeOfDay(party("2026-11-01", "19:00", "2026-11-01", "23:00"))).toBe("19:00 – 23:00");
    expect(formatPartyTimeOfDay(party("2026-11-01", "22:00", "2026-11-02", "02:00"))).toBe("22:00 – 11/02 02:00");
    expect(formatPartyTimeOfDay(party("2026-11-01", ""))).toBe("時間待定");
    expect(formatPartyTimeOfDay(party("", ""))).toBe("");
  });
});

describe("formatSubPartyRange", () => {
  it("prints Taiwan time whatever the server zone, with same-day ends as a time", () => {
    const originalTz = process.env.TZ;
    process.env.TZ = "UTC";
    try {
      expect(formatSubPartyRange("2026-11-01T19:00:00+08:00")).toBe("11/01 19:00");
      expect(formatSubPartyRange("2026-11-01T19:00:00+08:00", "2026-11-01T23:00:00+08:00")).toBe(
        "11/01 19:00 – 23:00",
      );
      expect(formatSubPartyRange("2026-11-01T22:00:00+08:00", "2026-11-02T02:00:00+08:00")).toBe(
        "11/01 22:00 – 11/02 02:00",
      );
    } finally {
      process.env.TZ = originalTz;
    }
  });

  it("says when the time or the start is not decided", () => {
    expect(formatSubPartyRange("2026-11-01")).toBe("11/01（時間待定）");
    expect(formatSubPartyRange("2026-11-01", "2026-11-02")).toBe("11/01（時間待定） – 11/02（時間待定）");
    expect(formatSubPartyRange("")).toBe("待定");
  });
});

describe("subPartyTimeParts", () => {
  it("puts the day apart from the time of day", () => {
    expect(subPartyTimeParts("2026-11-01T19:00:00+08:00", "2026-11-01T23:00:00+08:00")).toEqual({
      day: "11/01",
      time: "19:00 – 23:00",
    });
    expect(subPartyTimeParts("2026-11-01T22:00:00+08:00", "2026-11-02T02:00:00+08:00")).toEqual({
      day: "11/01 – 11/02",
      time: "22:00 – 02:00",
    });
    expect(subPartyTimeParts("2026-11-01T19:00:00+08:00")).toEqual({ day: "11/01", time: "19:00" });
  });

  it("says 時間待定 or 待定", () => {
    expect(subPartyTimeParts("2026-11-01")).toEqual({ day: "11/01", time: "時間待定" });
    expect(subPartyTimeParts("")).toEqual({ day: "", time: "待定" });
  });
});
