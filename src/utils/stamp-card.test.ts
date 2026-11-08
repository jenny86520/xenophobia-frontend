import { stampCard, stampProgressText } from "./stamp-card";

const days = (view: ReturnType<typeof stampCard>) => view.slots.map((slot) => slot.day);
const stamped = (view: ReturnType<typeof stampCard>) => view.slots.filter((slot) => slot.stamped).map((slot) => slot.day);
const today = (view: ReturnType<typeof stampCard>) => view.slots.find((slot) => slot.today)?.day ?? null;
const bonus = (view: ReturnType<typeof stampCard>) => view.slots.filter((slot) => slot.bonus).map((slot) => slot.day);

describe("stampCard", () => {
  it("shows a short run whole, the last slot being the bonus", () => {
    const view = stampCard({ streak: 3, requiredDays: 7, checkedInToday: true });
    expect(days(view)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(stamped(view)).toEqual([1, 2, 3]);
    expect(bonus(view)).toEqual([7]);
    expect(view.page).toBeNull();
  });

  it("marks the last stamp as today once checked in, else the next empty slot", () => {
    expect(today(stampCard({ streak: 3, requiredDays: 7, checkedInToday: true }))).toBe(3);
    expect(today(stampCard({ streak: 3, requiredDays: 7, checkedInToday: false }))).toBe(4);
  });

  it("stamps every slot, the bonus included, on the day the run is complete", () => {
    const view = stampCard({ streak: 7, requiredDays: 7, checkedInToday: true });
    expect(stamped(view)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(today(view)).toBe(7);
    expect(view.slots[6]).toMatchObject({ stamped: true, bonus: true, today: true });
  });

  it("starts from the first slot after a missed day", () => {
    const view = stampCard({ streak: 0, requiredDays: 7, checkedInToday: false });
    expect(stamped(view)).toEqual([]);
    expect(today(view)).toBe(1);
  });

  it("has no today slot when today's check-in is not part of the run", () => {
    const view = stampCard({ streak: 0, requiredDays: 7, checkedInToday: true });
    expect(stamped(view)).toEqual([]);
    expect(today(view)).toBeNull();
  });

  it("keeps up to 30 days on one card", () => {
    const view = stampCard({ streak: 12, requiredDays: 30, checkedInToday: false });
    expect(view.slots).toHaveLength(30);
    expect(view.page).toBeNull();
  });

  it("splits longer runs into cards of ten and opens the one holding today", () => {
    const view = stampCard({ streak: 23, requiredDays: 60, checkedInToday: false });
    expect(view.page).toEqual({ index: 3, count: 6 });
    expect(days(view)).toEqual([21, 22, 23, 24, 25, 26, 27, 28, 29, 30]);
    expect(stamped(view)).toEqual([21, 22, 23]);
    expect(today(view)).toBe(24);
    expect(bonus(view)).toEqual([]);
  });

  it("opens a requested card", () => {
    const view = stampCard({ streak: 23, requiredDays: 60, checkedInToday: false }, 2);
    expect(view.page).toEqual({ index: 2, count: 6 });
    expect(stamped(view)).toEqual(days(view));
  });

  it("ignores a card that does not exist", () => {
    const progress = { streak: 23, requiredDays: 60, checkedInToday: false };
    for (const card of [0, 9, 1.5, Number.NaN]) {
      expect(stampCard(progress, card).page).toEqual({ index: 3, count: 6 });
    }
  });

  it("puts only the bonus day on the last card when the days do not divide by ten", () => {
    const view = stampCard({ streak: 0, requiredDays: 31, checkedInToday: false }, 4);
    expect(view.page).toEqual({ index: 4, count: 4 });
    expect(days(view)).toEqual([31]);
    expect(bonus(view)).toEqual([31]);
  });

  it("opens the first card when there is no today slot and no streak", () => {
    expect(stampCard({ streak: 0, requiredDays: 60, checkedInToday: true }).page).toEqual({ index: 1, count: 6 });
  });
});

describe("stampProgressText", () => {
  it("says how many days are left until the bonus", () => {
    expect(stampProgressText(3, 7)).toBe("3 / 7 天・再 4 天 +1");
    expect(stampProgressText(0, 7)).toBe("0 / 7 天・再 7 天 +1");
  });

  it("says the card is full on the bonus day", () => {
    expect(stampProgressText(7, 7)).toBe("7 / 7 天・已集滿 +1");
  });
});
