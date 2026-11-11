import type { RatingChange } from "@/types/match";

/** "+28", "−25" (a real minus sign, read as minus) or "±0". */
export function signedPoints(value: number): string {
  if (value > 0) return `+${value}`;
  if (value < 0) return `−${Math.abs(value)}`;
  return "±0";
}

/** "勝負 +25・個人 +3", or "勝負 +25・沒有個人數據" when there was nothing to compare. */
export function ratingBreakdown(change: Pick<RatingChange, "teamPart" | "personalPart" | "note">): string {
  const team = `勝負 ${signedPoints(change.teamPart)}`;
  return change.note === "no-stats" ? `${team}・沒有個人數據` : `${team}・個人 ${signedPoints(change.personalPart)}`;
}

/** SWING per round as "+3.2%", "−1.5%" or "±0.0%" (one decimal, a real minus sign). */
export function swingText(value: number): string {
  const text = `${Math.abs(value).toFixed(1)}%`;
  if (Math.round(value * 10) === 0) return `±${text}`;
  return value > 0 ? `+${text}` : `−${text}`;
}
