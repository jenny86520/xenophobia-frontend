/**
 * The stamp card on the 點數 tab: the running campaign's N days as slots, the first `streak` of
 * them stamped. Only maps the backend's two numbers onto slots; the streak rules stay in the backend.
 */

/** Up to this many days the whole card is shown at once (three rows of ten). */
export const WHOLE_CARD_MAX_DAYS = 30;
/** Longer campaigns are split into cards of this many slots, one shown at a time. */
export const SLOTS_PER_CARD = 10;

export type StampProgress = { streak: number; requiredDays: number; checkedInToday: boolean };

export type StampSlot = {
  /** 1-based day of the run. */
  day: number;
  stamped: boolean;
  /** Today's slot: the last stamp once checked in, else the next empty one. */
  today: boolean;
  /** The last day, which earns the streak bonus. */
  bonus: boolean;
};

export type StampCardView = {
  slots: StampSlot[];
  /** Which card is shown, or null when the whole run fits on one. */
  page: { index: number; count: number } | null;
};

/**
 * Today's slot, or null when there is none: checked in today but the check-in is not part of this
 * campaign's run (a campaign created after the member checked in today).
 */
function todaySlot({ streak, requiredDays, checkedInToday }: StampProgress): number | null {
  if (checkedInToday) return streak > 0 ? Math.min(streak, requiredDays) : null;
  return Math.min(streak + 1, requiredDays);
}

/** The slots to show; `requestedCard` (from `?card=`) is used only when it names an existing card. */
export function stampCard(progress: StampProgress, requestedCard?: number): StampCardView {
  const { streak, requiredDays } = progress;
  const today = todaySlot(progress);
  const slot = (day: number): StampSlot => ({
    day,
    stamped: day <= streak,
    today: day === today,
    bonus: day === requiredDays,
  });

  if (requiredDays <= WHOLE_CARD_MAX_DAYS) {
    return { slots: Array.from({ length: requiredDays }, (_, i) => slot(i + 1)), page: null };
  }

  const count = Math.ceil(requiredDays / SLOTS_PER_CARD);
  const index =
    requestedCard !== undefined && Number.isInteger(requestedCard) && requestedCard >= 1 && requestedCard <= count
      ? requestedCard
      : Math.ceil(Math.max(today ?? streak, 1) / SLOTS_PER_CARD);
  const first = (index - 1) * SLOTS_PER_CARD + 1;
  const last = Math.min(first + SLOTS_PER_CARD - 1, requiredDays);
  return { slots: Array.from({ length: last - first + 1 }, (_, i) => slot(first + i)), page: { index, count } };
}

/** The one line of progress text, e.g. 「3 / 7 天・再 4 天 +1」; also what assistive tech reads. */
export function stampProgressText(streak: number, requiredDays: number): string {
  if (streak >= requiredDays) return `${requiredDays} / ${requiredDays} 天・已集滿 +1`;
  return `${streak} / ${requiredDays} 天・再 ${requiredDays - streak} 天 +1`;
}
