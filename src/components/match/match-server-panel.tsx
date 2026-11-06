import { Gamepad2 } from "lucide-react";
import { ctaPrimaryClasses } from "@/components/brand/cta-link";
import { MetaLabel } from "@/components/brand/meta-label";
import type { MatchConnect, MatchServer, MatchStatus } from "@/types/match";

/** Statuses in which the server moves on its own, so the match room refreshes itself. */
export const SERVER_LIVE_STATUSES: readonly MatchStatus[] = ["server_starting", "server_ready", "in_game"];

const STATUS_TEXT: Partial<Record<MatchStatus, string>> = {
  server_starting: "正在準備伺服器，可能需要幾分鐘（伺服器開機時會先檢查更新）。",
  server_ready: "伺服器已就緒：進入遊戲後會自動分到自己的隊伍，十人都進來後約 10 秒自動開始刀戰，刀戰贏的一方在聊天輸入 !stay 或 !switch 選邊。",
  in_game: "比賽進行中。",
  completed: "比賽已結束。",
};

function Score({
  server,
  completed,
  teamNames,
}: {
  server: MatchServer;
  completed: boolean;
  teamNames: { A: string; B: string };
}) {
  if (server.scoreA === null || server.scoreB === null) return null;
  const result = !completed ? null : server.winner ? `${teamNames[server.winner]}獲勝` : "平手";
  return (
    <div className="flex flex-col gap-2">
      <p
        className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-ink"
        aria-label={`${teamNames.A} ${server.scoreA} 比 ${teamNames.B} ${server.scoreB}`}
      >
        <span className="text-body text-ink-secondary">{teamNames.A}</span>
        <span className="font-mono text-h1 tabular-nums">
          {server.scoreA} : {server.scoreB}
        </span>
        <span className="text-body text-ink-secondary">{teamNames.B}</span>
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

/**
 * The match on its game server, in the middle of the match room: what is happening, the server, the
 * live or final score by team name. The match's players and managers also get how to join. Each
 * player's numbers sit beside them in the team columns (signed-in viewers only).
 */
export function MatchServerPanel({
  status,
  server,
  connect,
  teamNames,
  signedIn,
}: {
  status: MatchStatus;
  server: MatchServer;
  connect: MatchConnect | null;
  teamNames: { A: string; B: string };
  /** false for visitors, who are told to sign in for the players' numbers. */
  signedIn: boolean;
}) {
  const completed = status === "completed";
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        {STATUS_TEXT[status] && (
          <p role="status" className="text-body text-ink">
            {STATUS_TEXT[status]}
          </p>
        )}
        {server.serverName && <MetaLabel>{`伺服器：${server.serverName}`}</MetaLabel>}
      </div>
      <Score server={server} completed={completed} teamNames={teamNames} />
      {connect && <Connect connect={connect} />}
      {!signedIn && (status === "in_game" || completed) && server.resultSource !== "manual" && (
        <MetaLabel>登入後可看到每位玩家的數據</MetaLabel>
      )}
      {completed && server.resultSource === "manual" && (
        <p className="text-body text-ink-secondary">手動輸入比分的場次沒有玩家數據。</p>
      )}
    </div>
  );
}
