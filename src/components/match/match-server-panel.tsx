import { Gamepad2 } from "lucide-react";
import { ctaPrimaryClasses } from "@/components/brand/cta-link";
import { MetaLabel } from "@/components/brand/meta-label";
import { Heading } from "@/components/brand/typography";
import type { MatchConnect, MatchPlayerStats, MatchServer, MatchStatus } from "@/types/match";
import { MatchAutoRefresh } from "./veto-live";

/** Statuses in which the server moves on its own, so the page refreshes itself. */
export const SERVER_LIVE_STATUSES: readonly MatchStatus[] = ["server_starting", "server_ready", "in_game"];

const STATUS_TEXT: Partial<Record<MatchStatus, string>> = {
  server_starting: "正在準備伺服器，可能需要幾分鐘（伺服器開機時會先檢查更新）。",
  server_ready: "伺服器已就緒：進入遊戲後會自動分到自己的隊伍，十人都進來後約 10 秒自動開始刀戰，刀戰贏的一方在聊天輸入 !stay 或 !switch 選邊。",
  in_game: "比賽進行中。",
  completed: "比賽已結束。",
};

function Score({ server, completed }: { server: MatchServer; completed: boolean }) {
  if (server.scoreA === null || server.scoreB === null) return null;
  const result = !completed
    ? null
    : server.winner
      ? `${server.winner} 隊獲勝`
      : "平手";
  return (
    <div className="flex flex-col gap-2">
      <p className="flex items-baseline gap-4 text-ink" aria-label={`A 隊 ${server.scoreA} 比 B 隊 ${server.scoreB}`}>
        <span className="text-body text-ink-secondary">A 隊</span>
        <span className="font-mono text-h1 tabular-nums">
          {server.scoreA} : {server.scoreB}
        </span>
        <span className="text-body text-ink-secondary">B 隊</span>
      </p>
      {result && (
        <p className="text-lead text-ink">
          {result}
          {server.resultSource === "manual" && <span className="ml-2 text-body text-ink-muted">（比分為手動輸入）</span>}
        </p>
      )}
    </div>
  );
}

function Connect({ connect }: { connect: MatchConnect }) {
  return (
    <div className="flex flex-col gap-3">
      {/* A plain link: steam:// opens the game, which next/link cannot do. It joins only while CS2
          is running: a closed CS2 starts but stays in the menu (tested 2026-11-06), hence the hint. */}
      <a href={connect.url} className={ctaPrimaryClasses("default", "self-start")}>
        <Gamepad2 aria-hidden="true" className="size-5" />
        進入遊戲
      </a>
      <p className="text-body text-ink">請先開啟 CS2，進到主選單後再按「進入遊戲」；遊戲沒開時按只會打開遊戲、不會連線。</p>
      <p className="text-caption text-ink-muted">
        沒有反應時，在遊戲主控台輸入
        <span className="mx-1 font-mono text-ink">{`connect ${connect.address}; password ${connect.password}`}</span>
      </p>
      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-body">
        <dt className="text-ink-secondary">位址</dt>
        <dd className="font-mono text-ink">{connect.address}</dd>
        <dt className="text-ink-secondary">密碼</dt>
        <dd className="font-mono text-ink">{connect.password}</dd>
      </dl>
    </div>
  );
}

function StatsTable({ stats, team }: { stats: MatchPlayerStats[]; team: "A" | "B" }) {
  const rows = stats.filter((row) => row.team === team);
  if (rows.length === 0) return null;
  return (
    <table className="w-full text-body">
      <caption className="mb-2 text-left font-mono text-label text-ink-secondary">{`${team} 隊`}</caption>
      <thead>
        <tr className="border-b border-line text-left text-caption text-ink-muted">
          <th scope="col" className="py-2 font-normal">
            玩家
          </th>
          <th scope="col" className="py-2 text-right font-normal">
            <abbr title="擊殺">K</abbr>
          </th>
          <th scope="col" className="py-2 text-right font-normal">
            <abbr title="死亡">D</abbr>
          </th>
          <th scope="col" className="py-2 text-right font-normal">
            <abbr title="助攻">A</abbr>
          </th>
          <th scope="col" className="py-2 text-right font-normal">
            <abbr title="每回合平均傷害">ADR</abbr>
          </th>
          <th scope="col" className="py-2 text-right font-normal">
            爆頭率
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.playerId} className="border-b border-line text-ink">
            <th scope="row" className="py-2 text-left font-normal">
              {row.name}
            </th>
            <td className="py-2 text-right font-mono tabular-nums">{row.kills}</td>
            <td className="py-2 text-right font-mono tabular-nums">{row.deaths}</td>
            <td className="py-2 text-right font-mono tabular-nums">{row.assists}</td>
            <td className="py-2 text-right font-mono tabular-nums">{row.adr}</td>
            <td className="py-2 text-right font-mono tabular-nums">{`${row.headshotPercent}%`}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/**
 * The match on its game server for everyone: what is happening, the server, the live or final
 * score. The match's players and managers also get how to join; signed-in people see each
 * player's stats (null = not signed in). Refreshes itself while the server moves on its own.
 */
export function MatchServerPanel({
  status,
  server,
  connect,
  stats,
}: {
  status: MatchStatus;
  server: MatchServer;
  connect: MatchConnect | null;
  stats: MatchPlayerStats[] | null;
}) {
  const completed = status === "completed";
  return (
    <div className="flex flex-col gap-8">
      <MatchAutoRefresh active={SERVER_LIVE_STATUSES.includes(status)} />
      <div className="flex flex-col gap-2">
        {STATUS_TEXT[status] && (
          <p role="status" className="text-body text-ink">
            {STATUS_TEXT[status]}
          </p>
        )}
        {server.serverName && <MetaLabel>{`伺服器：${server.serverName}`}</MetaLabel>}
      </div>
      <Score server={server} completed={completed} />
      {connect && <Connect connect={connect} />}
      {stats === null ? (
        (status === "in_game" || completed) && <MetaLabel>登入後可看到每位玩家的數據</MetaLabel>
      ) : stats.length > 0 ? (
        <div className="flex flex-col gap-6">
          <Heading level={3}>玩家數據</Heading>
          <StatsTable stats={stats} team="A" />
          <StatsTable stats={stats} team="B" />
        </div>
      ) : (
        completed &&
        server.resultSource === "manual" && <p className="text-body text-ink-secondary">手動輸入比分的場次沒有玩家數據。</p>
      )}
    </div>
  );
}
