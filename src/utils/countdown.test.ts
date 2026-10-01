import { formatCountdownToStart } from "./countdown";

describe("formatCountdownToStart", () => {
  it("returns a 'Nd Nh Nm Ns' style string when the target is in the future", () => {
    const now = new Date();
    const target = new Date(now.getTime() + (2 * 86400 + 3 * 3600 + 4 * 60 + 5) * 1000);
    const targetDate = target.toISOString().slice(0, 10);
    const targetTime = target.toTimeString().slice(0, 5);

    const result = formatCountdownToStart(targetDate, targetTime);

    expect(result).toMatch(/^\d+d \d+h \d+m \d+s$/);
  });

  it("returns 'Starting now' when the target time has already arrived or passed", () => {
    const past = new Date(Date.now() - 60_000);
    const targetDate = past.toISOString().slice(0, 10);
    const targetTime = past.toTimeString().slice(0, 5);

    expect(formatCountdownToStart(targetDate, targetTime)).toBe("Starting now");
  });
});
