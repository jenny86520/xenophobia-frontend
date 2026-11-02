import type { PartySchedule } from "@/types/party";
import { formatSubPartyTime } from "./datetime";

/**
 * How party and sub-party times read on the site. The backend decides what is valid and what has
 * started; these only print what it sends: "" is 待定, a date without a time is 時間待定.
 */

export const UNDECIDED = "待定";
export const TIME_UNDECIDED = "時間待定";

/** "2026-11-01 19:00", "2026-11-01 19:00 – 23:00", "2026-11-01 22:00 – 2026-11-02 02:00", "2026-11-01（時間待定）" or "待定". */
export function formatPartyTime(party: PartySchedule): string {
  if (!party.startDate) return UNDECIDED;
  const start = party.startTime ? `${party.startDate} ${party.startTime}` : `${party.startDate}（${TIME_UNDECIDED}）`;
  if (!party.endDate) return start;
  if (party.endDate === party.startDate) {
    return party.startTime && party.endTime ? `${start} – ${party.endTime}` : start;
  }
  const end = party.endTime ? `${party.endDate} ${party.endTime}` : `${party.endDate}（${TIME_UNDECIDED}）`;
  return `${start} – ${end}`;
}

/**
 * The time part, for places that already show the start date on its own: "19:00", "19:00 – 23:00",
 * "22:00 – 11/02 02:00", "時間待定"; "" while the date is undecided.
 */
export function formatPartyTimeOfDay(party: PartySchedule): string {
  if (!party.startDate) return "";
  const start = party.startTime || TIME_UNDECIDED;
  if (!party.endDate) return start;
  if (party.endDate === party.startDate) {
    return party.startTime && party.endTime ? `${start} – ${party.endTime}` : start;
  }
  const endDay = party.endDate.slice(5).replace("-", "/");
  return `${start} – ${party.endTime ? `${endDay} ${party.endTime}` : endDay}`;
}

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/** "MM/DD HH:mm" (Taiwan time) for a stored date-time, "MM/DD（時間待定）" for a date alone, null for "". */
function subPartyMoment(value: string): { day: string; text: string; hasTime: boolean } | null {
  if (!value) return null;
  if (DATE_ONLY.test(value)) {
    const day = value.slice(5).replace("-", "/");
    return { day, text: `${day}（${TIME_UNDECIDED}）`, hasTime: false };
  }
  const text = formatSubPartyTime(value);
  return { day: text.slice(0, 5), text, hasTime: true };
}

/** "11/01 19:00", "11/01 19:00 – 23:00", "11/01 22:00 – 11/02 02:00", "11/01（時間待定）" or "待定". */
export function formatSubPartyRange(startDateTime: string, endDateTime = ""): string {
  const start = subPartyMoment(startDateTime);
  if (!start) return UNDECIDED;
  const end = subPartyMoment(endDateTime);
  if (!end) return start.text;
  if (end.day === start.day) {
    return start.hasTime && end.hasTime ? `${start.text} – ${end.text.slice(6)}` : start.text;
  }
  return `${start.text} – ${end.text}`;
}

/**
 * A sub-party time split for its row: the day (small, "11/01" or "11/01 – 11/02") and the time of
 * day (large, "22:00 – 23:00", "時間待定" or "待定"), so long ranges do not wrap mid-way.
 */
export function subPartyTimeParts(startDateTime: string, endDateTime = ""): { day: string; time: string } {
  const start = subPartyMoment(startDateTime);
  if (!start) return { day: "", time: UNDECIDED };
  const end = subPartyMoment(endDateTime);
  const day = end && end.day !== start.day ? `${start.day} – ${end.day}` : start.day;
  if (!start.hasTime) return { day, time: TIME_UNDECIDED };
  const startTime = start.text.slice(6);
  return { day, time: end?.hasTime ? `${startTime} – ${end.text.slice(6)}` : startTime };
}
