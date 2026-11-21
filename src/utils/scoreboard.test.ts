import {
  cellValue,
  defaultSort,
  parseScoreboardSort,
  SCOREBOARD_COLUMNS,
  scoreboardHref,
  sortRows,
  swingTier,
  visibleColumns,
  type ScoreboardRow,
} from "./scoreboard";

const row = (name: string, extra: Partial<ScoreboardRow> = {}): ScoreboardRow => ({
  playerId: name,
  name,
  team: "A",
  kills: 10,
  deaths: 10,
  assists: 2,
  damage: 2000,
  roundsPlayed: 24,
  adr: 80,
  headshotPercent: 40,
  kdDiff: 0,
  kdRatio: 1,
  kastPercent: 70,
  multiKillRounds: 2,
  headshotKills: 4,
  multiKills: { 2: 2, 3: 0, 4: 0, 5: 0 },
  clutches: 0,
  firstKills: 1,
  firstDeaths: 1,
  tradeKills: 0,
  mvp: 0,
  swing: null,
  ratingChange: null,
  ...extra,
});

const names = (rows: ScoreboardRow[]) => rows.map((r) => r.name);
const column = (key: string) => SCOREBOARD_COLUMNS.find((c) => c.key === key)!;

describe("defaultSort", () => {
  it("sorts by SWING once any player has it, else by ADR", () => {
    expect(defaultSort([row("甲"), row("乙", { swing: 1.2 })])).toEqual({ key: "swing", direction: "desc" });
    expect(defaultSort([row("甲")])).toEqual({ key: "adr", direction: "desc" });
  });
});

describe("parseScoreboardSort", () => {
  const rows = [row("甲")];
  it("reads each team's own parameters", () => {
    expect(parseScoreboardSort({ sortA: "kills", dirA: "asc", sortB: "adr" }, "A", rows)).toEqual({
      key: "kills",
      direction: "asc",
    });
    expect(parseScoreboardSort({ sortA: "kills", sortB: "deaths" }, "B", rows)).toEqual({
      key: "deaths",
      direction: "desc",
    });
  });

  it("falls back to the default for unknown columns", () => {
    expect(parseScoreboardSort({ sortA: "nope" }, "A", rows)).toEqual(defaultSort(rows));
    // 評分 is no longer a scoreboard column (an old link still works).
    expect(parseScoreboardSort({ sortA: "rating" }, "A", rows)).toEqual(defaultSort(rows));
  });
});

describe("sortRows", () => {
  it("orders high to low or low to high, ties by name", () => {
    const rows = [row("Cat", { adr: 70 }), row("Amy", { adr: 90 }), row("Bob", { adr: 70 })];
    expect(names(sortRows(rows, { key: "adr", direction: "desc" }, "full"))).toEqual(["Amy", "Bob", "Cat"]);
    expect(names(sortRows(rows, { key: "adr", direction: "asc" }, "full"))).toEqual(["Bob", "Cat", "Amy"]);
  });

  it("puts empty cells last whichever way", () => {
    const rows = [row("甲"), row("乙", { swing: -1 }), row("丙", { swing: 2 })];
    expect(names(sortRows(rows, { key: "swing", direction: "desc" }, "full"))).toEqual(["丙", "乙", "甲"]);
    expect(names(sortRows(rows, { key: "swing", direction: "asc" }, "full"))).toEqual(["乙", "丙", "甲"]);
  });
});

describe("cells and columns", () => {
  it("leaves out what a demo does not have", () => {
    expect(cellValue(column("kast"), row("甲"), "basic")).toBeNull();
    expect(cellValue(column("kast"), row("甲"), "full")).toBe(70);
    expect(cellValue(column("adr"), row("甲"), "basic")).toBe(80);
  });

  it("leads with SWING and has no 評分 column", () => {
    const keys = visibleColumns().map((c) => c.key);
    expect(keys[0]).toBe("swing");
    expect(keys).not.toContain("rating");
  });

  it("colours SWING gold from +10%, green from +3%, plain from 0 and red below", () => {
    expect([12.4, 10, 9.9, 3, 2.9, 0, -0.1, -8].map(swingTier)).toEqual([
      "gold",
      "gold",
      "good",
      "good",
      "even",
      "even",
      "bad",
      "bad",
    ]);
  });

  it("formats signed numbers and ratios", () => {
    expect(column("kd-diff").format(-3)).toBe("−3");
    expect(column("kd").format(1.5)).toBe("1.50");
    expect(column("swing").format(3.2)).toBe("+3.2%");
  });
});

describe("scoreboardHref", () => {
  const current = { A: { key: "adr", direction: "desc" as const }, B: { key: "swing", direction: "desc" as const } };
  it("flips the same column, starts another high to low, keeps the other team", () => {
    expect(scoreboardHref("m1", "A", "adr", current)).toBe(
      "/matches/m1?sortA=adr&dirA=asc&sortB=swing&dirB=desc#scoreboard-A",
    );
    expect(scoreboardHref("m1", "B", "kills", current)).toBe(
      "/matches/m1?sortA=adr&dirA=desc&sortB=kills&dirB=desc#scoreboard-B",
    );
  });
});
