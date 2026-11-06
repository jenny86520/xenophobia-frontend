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
