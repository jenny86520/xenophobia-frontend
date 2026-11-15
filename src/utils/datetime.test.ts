import { formatSubPartyTime, formatTaipeiDateTime, formatTaipeiMonthDayTime } from "./datetime";

describe("formatSubPartyTime", () => {
  const originalTz = process.env.TZ;
  afterEach(() => {
    process.env.TZ = originalTz;
  });

  it("formats the stored Taiwan time as MM/DD HH:mm", () => {
    expect(formatSubPartyTime("2026-09-30T18:30:00+08:00")).toBe("09/30 18:30");
    expect(formatSubPartyTime("2026-01-05T07:05:00+08:00")).toBe("01/05 07:05");
  });

  it("converts other offsets to Taiwan time", () => {
    expect(formatSubPartyTime("2026-11-01T11:00:00Z")).toBe("11/01 19:00");
    expect(formatSubPartyTime("2026-12-31T16:00:00Z")).toBe("01/01 00:00");
  });

  it.each(["UTC", "America/New_York", "Asia/Taipei"])("does not depend on the server time zone (%s)", (tz) => {
    process.env.TZ = tz;
    expect(formatSubPartyTime("2026-11-01T19:00:00+08:00")).toBe("11/01 19:00");
  });

  it("returns the input unchanged when it is not a date", () => {
    expect(formatSubPartyTime("TBD")).toBe("TBD");
  });
});

describe("formatTaipeiDateTime", () => {
  it("shows a UTC timestamp as the Taiwan date and time", () => {
    expect(formatTaipeiDateTime("2026-10-23T16:30:00.000Z")).toBe("2026/10/24 00:30");
  });

  it("returns the input unchanged when it is not a date", () => {
    expect(formatTaipeiDateTime("nope")).toBe("nope");
  });
});

describe("formatTaipeiMonthDayTime", () => {
  it("shows an instant as M/D HH:mm in Taiwan, without leading zeros on the date", () => {
    expect(formatTaipeiMonthDayTime("2026-12-24T12:00:00.000Z")).toBe("12/24 20:00");
    expect(formatTaipeiMonthDayTime("2027-01-04T23:05:00.000Z")).toBe("1/5 07:05");
  });

  it("returns the input unchanged when it is not a date", () => {
    expect(formatTaipeiMonthDayTime("nope")).toBe("nope");
  });
});
