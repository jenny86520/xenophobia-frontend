import { ArrowDown, ArrowUp } from "lucide-react";
import Link from "next/link";
import { Heading } from "@/components/brand/typography";
import { MemberTitleTag } from "@/components/cosmetics/member-title-tag";
import { cn } from "@/lib/utils";
import type { MatchPlayer, MatchServer, StatsDetail } from "@/types/match";
import {
  SWING_TIER_LEGEND,
  cellValue,
  scoreboardHref,
  sortRows,
  swingTier,
  visibleColumns,
  type ScoreboardRow,
  type ScoreboardSort,
  type SwingTier,
} from "@/utils/scoreboard";

/** Text colours of the SWING tiers, all tokens (each AA on the page background). */
const SWING_TIER_CLASS: Record<SwingTier, string> = {
  gold: "text-gold",
  good: "text-success",
  even: "text-ink",
  bad: "text-destructive",
};

/** The SWING column stands out: a faint surface behind it and a hairline either side. */
const SWING_COLUMN = "border-x border-line bg-surface";

type Side = "A" | "B";

function resultText(server: MatchServer, side: Side): string {
  if (server.winner === null) return "平手";
  return server.winner === side ? "勝" : "負";
}

/**
 * One team's table. Each numeric heading is a link that sorts by it (no JavaScript needed); the
 * current one carries `aria-sort` and an arrow. Narrow screens scroll the table inside its own
 * keyboard-scrollable region with the player column pinned, never the page.
 */
function TeamTable({
  matchId,
  side,
  name,
  server,
  rows,
  players,
  detail,
  sorts,
}: {
  matchId: string;
  side: Side;
  name: string;
  server: MatchServer;
  rows: ScoreboardRow[];
  players: Map<string, MatchPlayer>;
  detail: StatsDetail;
  sorts: Record<Side, ScoreboardSort>;
}) {
  const sort = sorts[side];
  const columns = visibleColumns();
  const sorted = sortRows(rows, sort, detail);
  const score = side === "A" ? server.scoreA : server.scoreB;
  const titleId = `scoreboard-${side}-title`;
  return (
    <section id={`scoreboard-${side}`} aria-labelledby={titleId} className="flex scroll-mt-24 flex-col gap-3">
      <Heading level={3} id={titleId} className="flex flex-wrap items-baseline gap-x-4">
        <span>{name}</span>
        {score !== null && <span className="font-mono tabular-nums">{score}</span>}
        <span className="text-body text-ink-secondary">{resultText(server, side)}</span>
      </Heading>
      <div
        role="region"
        aria-labelledby={titleId}
        tabIndex={0}
        className="overflow-x-auto focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        <table className="w-full min-w-max border-collapse text-body">
          <caption className="sr-only">{`${name}每位玩家的成績，可點欄名排序`}</caption>
          <thead>
            <tr className="border-b border-line-strong">
              <th
                scope="col"
                className="sticky left-0 z-10 bg-background py-2 pr-6 text-left text-label font-normal text-ink-secondary"
              >
                玩家
              </th>
              {columns.map((column) => {
                const active = sort.key === column.key;
                const Arrow = sort.direction === "desc" ? ArrowDown : ArrowUp;
                return (
                  <th
                    key={column.key}
                    scope="col"
                    aria-sort={active ? (sort.direction === "desc" ? "descending" : "ascending") : undefined}
                    className={cn(
                      "px-3 py-2 text-right text-label font-normal whitespace-nowrap",
                      column.key === "swing" && cn(SWING_COLUMN, "px-4"),
                    )}
                  >
                    <Link
                      href={scoreboardHref(matchId, side, column.key, sorts)}
                      scroll={false}
                      className={cn(
                        "inline-flex items-center gap-1 hover:text-ink focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                        active || column.key === "swing" ? "text-ink" : "text-ink-secondary",
                      )}
                    >
                      {column.longLabel ? (
                        <>
                          <span aria-hidden="true">{column.label}</span>
                          <span className="sr-only">{column.longLabel}</span>
                        </>
                      ) : (
                        column.label
                      )}
                      {active && <Arrow aria-hidden="true" className="size-3.5 text-signal" />}
                    </Link>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => {
              const player = players.get(row.playerId);
              return (
                <tr key={row.playerId} className="border-b border-line" data-scoreboard-row={row.playerId}>
                  <th scope="row" className="sticky left-0 z-10 bg-background py-3 pr-6 text-left font-normal">
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-ink">
                      {player?.name ?? row.name}
                      {player?.memberTitle && <MemberTitleTag look={player.memberTitle} />}
                    </span>
                  </th>
                  {columns.map((column) => {
                    const value = cellValue(column, row, detail);
                    const swing = column.key === "swing";
                    const tier = swing && value !== null ? swingTier(value) : null;
                    return (
                      <td
                        key={column.key}
                        data-swing-tier={tier ?? undefined}
                        className={cn(
                          "px-3 py-3 text-right font-mono tabular-nums",
                          sort.key === column.key ? "text-ink" : "text-ink-secondary",
                          swing && cn(SWING_COLUMN, "px-4 text-lead font-semibold"),
                          tier && SWING_TIER_CLASS[tier],
                        )}
                      >
                        {value === null ? (
                          <>
                            <span aria-hidden="true">—</span>
                            <span className="sr-only">沒有資料</span>
                          </>
                        ) : (
                          column.format(value)
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/**
 * The finished match's scoreboard below the match room (spec scrim-match-server 賽後成績表): team
 * A's table, then team B's, each sorted on its own through the URL.
 */
export function MatchScoreboard({
  matchId,
  server,
  teamNames,
  rows,
  players,
  detail,
  sorts,
}: {
  matchId: string;
  server: MatchServer;
  teamNames: Record<Side, string>;
  rows: ScoreboardRow[];
  players: Map<string, MatchPlayer>;
  detail: StatsDetail;
  sorts: Record<Side, ScoreboardSort>;
}) {
  return (
    <div className="flex flex-col gap-10">
      <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-caption text-ink-muted">
        <span>SWING 是每回合讓隊伍勝率平均提高多少，評分的個人部分看的就是它。</span>
        {SWING_TIER_LEGEND.map(({ tier, label }) => (
          <span key={tier} className={cn("font-mono tabular-nums", SWING_TIER_CLASS[tier])}>
            {label}
          </span>
        ))}
      </p>
      {detail === "basic" && (
        <p className="text-caption text-ink-muted">
          這場的數據來自較早套用的 demo，當時還沒有計算 KAST、首殺、首死、多殺與殘局，顯示為「—」；管理員重新解析 demo
          後就會補上。
        </p>
      )}
      {(["A", "B"] as const).map((side) => (
        <TeamTable
          key={side}
          matchId={matchId}
          side={side}
          name={teamNames[side]}
          server={server}
          rows={rows.filter((row) => row.team === side)}
          players={players}
          detail={detail}
          sorts={sorts}
        />
      ))}
    </div>
  );
}
