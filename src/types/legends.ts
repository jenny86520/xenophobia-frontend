/** One place on a board: only the place, the member's nickname and the number are public. */
export type LegendEntry = { rank: number; nickname: string; value: number };

export type LegendBoard = {
  /** Backend board code, e.g. "scrim-rating"; new codes may appear without a frontend change. */
  code: string;
  /** The admins' (or default) catchy title, e.g. 「戰力天梯」. */
  title: string;
  /** What is counted, e.g. 「CS 內戰分數」; never changes. */
  metric: string;
  unit: string;
  countsTowardOverall: boolean;
  entries: LegendEntry[];
};

/** GET /api/legends: the overall ranking (points) and the boards in the admins' order. */
export type Legends = {
  overall: { title: string; entries: Array<{ rank: number; nickname: string; points: number }> };
  boards: LegendBoard[];
};
