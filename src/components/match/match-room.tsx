import { Crown, MapPinned } from "lucide-react";
import { Heading } from "@/components/brand/typography";
import { frameRow } from "@/components/cosmetics/frame";
import { MemberTitleTag } from "@/components/cosmetics/member-title-tag";
import type {
  ConfirmedTeam,
  ManagedMatch,
  MatchConnect,
  MatchDetail,
  MatchPlayer,
  MatchPlayerStats,
  MatchStatus,
  RatingChange,
  ScrimServerOption,
} from "@/types/match";
import { ratingBreakdown, signedPoints, swingText } from "@/utils/rating";
import { TeamNameForm } from "./match-forms";
import { CandidateList, StageActions } from "./match-manage";
import { MatchRoster } from "./match-roster";
import { MatchServerPanel, SERVER_LIVE_STATUSES } from "./match-server-panel";
import { MatchAutoRefresh } from "./veto-live";
import { VetoPanel } from "./veto-panel";

const ON_SERVER_OR_DONE: readonly MatchStatus[] = [...SERVER_LIVE_STATUSES, "completed"];
/** Nothing changes any more, so the room stops refreshing. */
const FINISHED: readonly MatchStatus[] = ["completed", "cancelled"];

/** One player's numbers on one line: K / D / A, ADR, headshot share. */
function StatsLine({ stats }: { stats: MatchPlayerStats }) {
  return (
    <span className="font-mono text-meta text-ink-secondary tabular-nums">
      {`${stats.kills} / ${stats.deaths} / ${stats.assists}`}
      <span className="sr-only">（擊殺／死亡／助攻）</span>
      {`・ADR ${stats.adr}・爆頭 ${stats.headshotPercent}%`}
      {stats.swing !== null && `・SWING ${swingText(stats.swing)}`}
    </span>
  );
}

/** A player's change in this rated match: the points first, then where they came from. */
function RatingChangeLine({ change }: { change: RatingChange }) {
  return (
    <span className="flex flex-wrap items-baseline gap-x-2 text-caption text-ink-secondary" data-rating-change>
      <span>
        評分
        <span className="ml-1 font-mono text-label text-ink tabular-nums">{signedPoints(change.delta)}</span>
      </span>
      <span>（{ratingBreakdown(change)}）</span>
    </span>
  );
}

/** A team's side of the room: its name, totals and players (captain first), as CS2 shows a team. */
function TeamColumn({
  matchId,
  side,
  team,
  players,
  statsOf,
  rename,
}: {
  matchId: string;
  side: "A" | "B";
  team: ConfirmedTeam;
  players: Map<string, MatchPlayer>;
  statsOf: Map<string, MatchPlayerStats>;
  /** Who may rename this team now: its captain, a manager, or nobody. */
  rename: "captain" | "manager" | null;
}) {
  const ids = [...team.playerIds].sort((a, b) => Number(b === team.captainId) - Number(a === team.captainId));
  return (
    <section aria-labelledby={`team-${side}-title`} className="flex flex-col gap-3" data-team={side}>
      <Heading level={3} id={`team-${side}-title`}>
        {team.name}
      </Heading>
      <p className="font-mono text-label text-ink-secondary tabular-nums">
        總分 {team.total}・平均 {team.average}
      </p>
      {rename && (
        <TeamNameForm
          matchId={matchId}
          side={side}
          current={team.name === `${side} 隊` ? "" : team.name}
          asManager={rename === "manager"}
        />
      )}
      <ul className="border-t border-line">
        {ids.map((id) => {
          const player = players.get(id);
          if (!player) return null;
          const stats = statsOf.get(id);
          return (
            <li key={id} {...frameRow(player.frame, "flex flex-col gap-1 border-b border-line py-3")}>
              <span className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <span className="inline-flex flex-wrap items-center gap-2 text-body text-ink">
                  {player.isCaptain && (
                    <>
                      <Crown aria-hidden="true" className="size-4 text-signal" />
                      <span className="sr-only">隊長</span>
                    </>
                  )}
                  {player.name}
                  <MemberTitleTag look={player.memberTitle} />
                </span>
                {player.rating !== undefined && (
                  <span className="font-mono text-label text-ink-secondary tabular-nums">{player.rating}</span>
                )}
              </span>
              {stats && <StatsLine stats={stats} />}
              {player.ratingChange && <RatingChangeLine change={player.ratingChange} />}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** What happens now, in the middle of the room: the veto, the server and score, or what comes next. */
function MatchStage({
  match,
  managed,
  canBan,
  connect,
  signedIn,
  candidate,
  servers,
  demoHref = null,
}: MatchRoomProps & { match: MatchDetail & { teams: NonNullable<MatchDetail["teams"]> } }) {
  const teamNames = { A: match.teams.A.name, B: match.teams.B.name };
  const onServer = ON_SERVER_OR_DONE.includes(match.status) && match.server;
  return (
    <div className="flex flex-col gap-8 lg:min-h-96" data-stage>
      <p className="text-lead text-ink">
        總分差 <span className="font-mono tabular-nums">{match.teams.difference}</span>
      </p>
      {match.status === "cancelled" && <p className="text-lead text-ink">這場已取消。</p>}
      {match.status === "teams_confirmed" && (
        <p className="text-body text-ink-secondary">隊伍已確認，等待開始 Ban 圖。</p>
      )}
      {onServer && match.server && (
        <section aria-labelledby="server-title" className="flex flex-col gap-4">
          <Heading level={3} id="server-title">
            比賽
          </Heading>
          {match.veto?.finalMap && (
            <p className="flex items-center gap-2 text-body text-ink">
              <MapPinned aria-hidden="true" className="size-4 text-signal" />
              地圖：{match.veto.finalMap.name}
            </p>
          )}
          <MatchServerPanel
            status={match.status}
            server={match.server}
            connect={connect}
            teamNames={teamNames}
            signedIn={signedIn}
            demoHref={demoHref}
          />
        </section>
      )}
      {match.veto && !onServer && (
        <section aria-labelledby="veto-title" className="flex flex-col gap-4">
          <Heading level={3} id="veto-title">
            Ban 圖
          </Heading>
          <VetoPanel matchId={match.id} status={match.status} veto={match.veto} canBan={canBan} teamNames={teamNames} />
        </section>
      )}
      {managed && <StageActions match={managed} candidate={candidate} servers={servers} />}
    </div>
  );
}

type MatchRoomProps = {
  /** The view to show: the manager's when there is one, else the signed-in or public view. */
  match: MatchDetail;
  managed: ManagedMatch | null;
  canBan: boolean;
  connect: MatchConnect | null;
  /** Each player's numbers (signed-in viewers and managers); null for visitors. */
  stats: MatchPlayerStats[] | null;
  /** The team the signed-in viewer captains, who may rename it while the names are open. */
  captainOf: "A" | "B" | null;
  signedIn: boolean;
  candidate: string | string[] | undefined;
  servers: ScrimServerOption[] | null;
  /** Where the viewer downloads the demo, when they may (a finished match's players and creator). */
  demoHref?: string | null;
};

/**
 * The match room, after CS2's own match screens: before the teams are confirmed, the roster by
 * sign-up and the manager's step; afterwards team A on the left, team B on the right and what
 * happens now in the middle (on narrow screens the middle comes first). It refreshes itself until
 * the match is completed or cancelled, so a lock, the teams or the veto starting reach everyone.
 */
export function MatchRoom(props: MatchRoomProps) {
  const { match, managed, stats, candidate, servers } = props;
  // Everyone follows the match without reloading until it is over: sign-ups, the lock, the teams,
  // the veto and the server all change from someone else's page.
  const refresh = !FINISHED.includes(match.status);
  const { teams } = match;

  if (!teams) {
    return (
      <div className="flex flex-col gap-10">
        <MatchAutoRefresh active={refresh} />
        {match.status === "cancelled" && <p className="text-lead text-ink">這場已取消。</p>}
        <MatchRoster match={match} />
        {/* Everyone follows the draft; only the manager's own cards (StageActions) choose one. */}
        {!managed && match.status === "team_draft" && match.candidates && match.candidates.length > 0 && (
          <section aria-labelledby="candidates-title" className="flex flex-col gap-3">
            <Heading level={3} id="candidates-title">
              分隊候選
            </Heading>
            <p className="text-body text-ink-secondary">管理者正在從這些方案中選擇分隊；總分差越小越平均。</p>
            <CandidateList matchId={match.id} candidates={match.candidates} selected={null} selectable={false} />
          </section>
        )}
        {managed && <StageActions match={managed} candidate={candidate} servers={servers} />}
      </div>
    );
  }

  const players = new Map(match.entries.flatMap((entry) => entry.players).map((p) => [p.playerId, p]));
  const statsOf = new Map((stats ?? []).map((row) => [row.playerId, row]));
  const renameOf = (side: "A" | "B") =>
    !match.teamNamesOpen ? null : managed ? "manager" : props.captainOf === side ? "captain" : null;
  return (
    // minmax(0, …) on every column: a plain 1fr grows to its content (the map list, the radar) and
    // pushes the page sideways on a phone. The middle is the widest, for the maps around the radar.
    <div className="grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.4fr)_minmax(0,1fr)] lg:gap-8">
      <MatchAutoRefresh active={refresh} />
      <TeamColumn
        matchId={match.id}
        side="A"
        team={teams.A}
        players={players}
        statsOf={statsOf}
        rename={renameOf("A")}
      />
      <div className="order-first lg:order-none lg:border-x lg:border-line lg:px-8">
        <MatchStage {...props} match={{ ...match, teams }} />
      </div>
      <TeamColumn
        matchId={match.id}
        side="B"
        team={teams.B}
        players={players}
        statsOf={statsOf}
        rename={renameOf("B")}
      />
    </div>
  );
}
