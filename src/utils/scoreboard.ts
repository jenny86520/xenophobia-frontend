import type { MatchPlayerStats, RatingChange, StatsDetail } from "@/types/match";
import { signedPoints, swingText } from "@/utils/rating";

/**
 * How a SWING value is coloured (spec scrim-match-server 賽後成績表): gold from +10%, green from
 * +3%, plain from 0, red below 0. The signed number is always written, so the colour only adds to it.
 */
export type SwingTier = "gold" | "good" | "even" | "bad";

export function swingTier(value: number): SwingTier {
  if (value >= 10) return "gold";
  if (value >= 3) return "good";
  return value >= 0 ? "even" : "bad";
}

/** Words for each colour, for the legend under the scoreboard. */
export const SWING_TIER_LEGEND: readonly { tier: SwingTier; label: string }[] = [
  { tier: "gold", label: "+10% 以上" },
  { tier: "good", label: "+3% 以上" },
  { tier: "even", label: "0～3%" },
  { tier: "bad", label: "低於 0" },
];

/**
 * The finished match's scoreboard (spec scrim-match-server 賽後成績表). Sorting only changes the
 * order on screen, so it lives here; every number comes worked out from the backend.
 */

/** One row of a team's table: the backend's stats plus this match's rating change, if rated. */
export type ScoreboardRow = MatchPlayerStats & { ratingChange: RatingChange | null };

export type SortDirection = "desc" | "asc";

export type ScoreboardColumn = {
  key: string;
  /** The short heading, as CS scoreboards write it. */
  label: string;
  /** What assistive tech reads for the heading when the short one is an abbreviation. */
  longLabel?: string;
  /** null = nothing to show (「—」), and it sorts last whichever way. */
  value: (row: ScoreboardRow) => number | null;
  format: (value: number) => string;
  /** Not in a demo's stats (`basic`): KAST, first kills and deaths, multi-kills, clutches. */
  fullOnly?: boolean;
};

const plain = (value: number) => String(value);
const percent = (value: number) => `${value}%`;

export const SCOREBOARD_COLUMNS: readonly ScoreboardColumn[] = [
  // SWING leads: it is what the match's rating weighs (spec scrim-match-server 賽後成績表).
  { key: "swing", label: "SWING", longLabel: "每回合 SWING", value: (r) => r.swing, format: swingText },
  { key: "kills", label: "K", longLabel: "擊殺", value: (r) => r.kills, format: plain },
  { key: "deaths", label: "D", longLabel: "死亡", value: (r) => r.deaths, format: plain },
  { key: "assists", label: "A", longLabel: "助攻", value: (r) => r.assists, format: plain },
  { key: "kd-diff", label: "+/-", longLabel: "擊殺減死亡", value: (r) => r.kdDiff, format: signedPoints },
  { key: "kd", label: "K/D", longLabel: "擊殺死亡比", value: (r) => r.kdRatio, format: (v) => v.toFixed(2) },
  { key: "adr", label: "ADR", longLabel: "每回合平均傷害", value: (r) => r.adr, format: plain },
  { key: "hs", label: "爆頭%", longLabel: "爆頭率", value: (r) => r.headshotPercent, format: percent },
  { key: "kast", label: "KAST%", value: (r) => r.kastPercent, format: percent, fullOnly: true },
  { key: "first-kills", label: "首殺", value: (r) => r.firstKills, format: plain, fullOnly: true },
  { key: "first-deaths", label: "首死", value: (r) => r.firstDeaths, format: plain, fullOnly: true },
  {
    key: "multi-kills",
    label: "多殺",
    longLabel: "多殺回合",
    value: (r) => r.multiKillRounds,
    format: plain,
    fullOnly: true,
  },
  { key: "clutches", label: "殘局勝", value: (r) => r.clutches, format: plain, fullOnly: true },
];

const COLUMN_KEYS = new Set(SCOREBOARD_COLUMNS.map((c) => c.key));

/** The columns a table shows (the rating change is shown in the match room, not here). */
export function visibleColumns(): readonly ScoreboardColumn[] {
  return SCOREBOARD_COLUMNS;
}

/** A cell's value, or null for 「—」 (an older demo result's missing columns, no SWING). */
export function cellValue(column: ScoreboardColumn, row: ScoreboardRow, detail: StatsDetail): number | null {
  if (column.fullOnly && detail === "basic") return null;
  return column.value(row);
}

export type ScoreboardSort = { key: string; direction: SortDirection };

/** SWING high to low once the demo is parsed, else ADR. */
export function defaultSort(rows: readonly ScoreboardRow[]): ScoreboardSort {
  return { key: rows.some((row) => row.swing !== null) ? "swing" : "adr", direction: "desc" };
}

type Params = Record<string, string | string[] | undefined>;
const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

/** `?sortA=adr&dirA=asc` → that team's sort; an unknown or hidden column falls back to the default. */
export function parseScoreboardSort(params: Params, side: "A" | "B", rows: readonly ScoreboardRow[]): ScoreboardSort {
  const key = first(params[`sort${side}`]);
  if (!key || !COLUMN_KEYS.has(key)) return defaultSort(rows);
  return { key, direction: first(params[`dir${side}`]) === "asc" ? "asc" : "desc" };
}

/** Rows in the chosen order; empty cells last whichever way, ties by name. */
export function sortRows(rows: readonly ScoreboardRow[], sort: ScoreboardSort, detail: StatsDetail): ScoreboardRow[] {
  const column = SCOREBOARD_COLUMNS.find((c) => c.key === sort.key) ?? SCOREBOARD_COLUMNS[0];
  const byName = (a: ScoreboardRow, b: ScoreboardRow) => a.name.localeCompare(b.name, "zh-Hant");
  return [...rows].sort((a, b) => {
    const x = cellValue(column, a, detail);
    const y = cellValue(column, b, detail);
    if (x === null || y === null) return x === y ? byName(a, b) : x === null ? 1 : -1;
    const diff = sort.direction === "desc" ? y - x : x - y;
    return diff !== 0 ? diff : byName(a, b);
  });
}

/**
 * The link a column heading points at: the same column flips its direction, another starts high to
 * low. The other team's sort stays as it is; the page comes back at this team's table.
 */
export function scoreboardHref(
  matchId: string,
  side: "A" | "B",
  key: string,
  current: Record<"A" | "B", ScoreboardSort>,
): string {
  const next: Record<"A" | "B", ScoreboardSort> = {
    ...current,
    [side]: {
      key,
      direction: current[side].key === key && current[side].direction === "desc" ? "asc" : "desc",
    },
  };
  const query = new URLSearchParams();
  for (const team of ["A", "B"] as const) {
    query.set(`sort${team}`, next[team].key);
    query.set(`dir${team}`, next[team].direction);
  }
  return `/matches/${encodeURIComponent(matchId)}?${query.toString()}#scoreboard-${side}`;
}
