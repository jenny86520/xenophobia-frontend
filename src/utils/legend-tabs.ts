import { CalendarCheck, Coins, Sparkles, Swords, Trophy } from "lucide-react";

/**
 * The /legends tabs, in display order; the first is the default. A board's tab is only where the page
 * puts it (presentation): ranks, order and titles all come from the backend. The icon is decorative.
 */
export const LEGEND_TABS = [
  { value: "overall", label: "總排行", icon: Trophy },
  { value: "party", label: "派對", icon: CalendarCheck },
  { value: "scrim", label: "內戰", icon: Swords },
  { value: "points", label: "簽到與點數", icon: Coins },
  { value: "other", label: "其他", icon: Sparkles },
] as const;

export type LegendTab = (typeof LEGEND_TABS)[number]["value"];

/** The tab of each board the site knows; a board added on the backend later goes to 其他. */
export const BOARD_TAB: Record<string, Exclude<LegendTab, "overall" | "other">> = {
  "party-attendance": "party",
  "sub-party-attendance": "party",
  "scrim-rating": "scrim",
  "scrim-matches": "scrim",
  "scrim-cancelled": "scrim",
  "checkin-streak": "points",
  "points-earned": "points",
};

/** Which tab a board code belongs to. */
export function tabOf(code: string): Exclude<LegendTab, "overall"> {
  return BOARD_TAB[code] ?? "other";
}

/** The boards of one tab, keeping the backend's order. */
export function boardsIn<T extends { code: string }>(tab: LegendTab, boards: T[]): T[] {
  return boards.filter((board) => tabOf(board.code) === tab);
}

/** 總排行 always, then each tab that has at least one board. */
export function visibleTabs(boards: Array<{ code: string }>): LegendTab[] {
  return LEGEND_TABS.map((tab) => tab.value).filter(
    (tab) => tab === "overall" || boardsIn(tab, boards).length > 0,
  );
}

/** The tab named by `?tab=`; anything missing, unknown or without boards is 總排行. */
export function parseLegendTab(value: string | string[] | undefined, boards: Array<{ code: string }>): LegendTab {
  return visibleTabs(boards).find((tab) => tab === value) ?? "overall";
}

/** The URL of a tab (總排行 is plain /legends), optionally jumping to one board on it. */
export function legendTabHref(tab: LegendTab, boardCode?: string): string {
  const base = tab === "overall" ? "/legends" : `/legends?tab=${tab}`;
  return boardCode ? `${base}#board-${boardCode}` : base;
}
