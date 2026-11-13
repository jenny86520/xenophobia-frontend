import Link from "next/link";
import { Spotlight } from "@/components/brand/spotlight";
import { Heading } from "@/components/brand/typography";
import { frameRow } from "@/components/cosmetics/frame";
import { MemberTitleTag } from "@/components/cosmetics/member-title-tag";
import { cn } from "@/lib/utils";
import type { ManagedMatch, MatchServerSession, ScrimServerOption, TeamCandidate } from "@/types/match";
import {
  CancelMatchForm,
  GenerateTeamsButton,
  ImportPartyButton,
  LockButton,
  RemovePlayerForm,
  TeamConfirmForm,
  UnconfirmTeamsForm,
  type TeamPlayer,
  UnlockForm,
  ManagerBanForm,
  MatchResultForm,
  ServerAbortForm,
  ServerStartForm,
  VetoResetForm,
  VetoStartForm,
  VetoUndoForm,
} from "./match-forms";

/** "?candidate=2" → index 1; anything else picks the best (first) candidate. */
export function candidateIndex(value: string | string[] | undefined, count: number): number {
  const n = Number(Array.isArray(value) ? value[0] : value);
  return Number.isInteger(n) && n >= 1 && n <= count ? n - 1 : 0;
}

/**
 * One candidate. For the manager the whole card is one link (its title stretched over the card)
 * that selects it and presets the team form below; the page stays at the candidates. Works without
 * JavaScript. Everyone else gets the same card to follow along, without the link.
 */
function CandidateCard({
  candidate,
  index,
  selected,
  matchId,
  selectable,
}: {
  candidate: TeamCandidate;
  index: number;
  selected: boolean;
  matchId: string;
  selectable: boolean;
}) {
  return (
    <li
      data-spotlight
      className={cn(
        "relative flex flex-col gap-4 rounded-sm border p-4 transition-colors",
        selectable && "has-[a:focus-visible]:ring-3 has-[a:focus-visible]:ring-ring/50",
        selected ? "border-signal bg-surface-elevated" : "border-line",
        selectable && !selected && "hover:border-line-strong",
      )}
    >
      <div className="flex items-baseline justify-between gap-4">
        <h4 className="font-heading text-h3 text-ink">
          {selectable ? (
            <Link
              href={`/matches/${matchId}?candidate=${index + 1}#team-candidates`}
              scroll={false}
              aria-current={selected ? "true" : undefined}
              className="after:absolute after:inset-0 focus-visible:outline-none"
            >
              {`方案 ${index + 1}`}
            </Link>
          ) : (
            `方案 ${index + 1}`
          )}
        </h4>
        <span className="font-mono text-label text-ink tabular-nums">分差 {candidate.difference}</span>
      </div>
      {(["teamA", "teamB"] as const).map((key) => {
        const side = candidate[key];
        return (
          <div key={key} className="flex flex-col gap-2">
            <p className="font-mono text-label text-ink-secondary tabular-nums">
              {key === "teamA" ? "A" : "B"} 隊・總分 {side.total}・平均 {side.average}
            </p>
            <ul className="border-t border-line">
              {side.players.map((player) => (
                <li
                  key={player.playerId}
                  {...frameRow(player.frame, "flex items-baseline justify-between gap-4 border-b border-line py-2 text-body text-ink")}
                >
                  <span className="inline-flex flex-wrap items-center gap-2">
                    {player.name}
                    <MemberTitleTag look={player.memberTitle} />
                  </span>
                  {player.rating !== undefined && (
                    <span className="font-mono text-label text-ink-secondary tabular-nums">{player.rating}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
      {selectable && (
        <p className={cn("text-caption", selected ? "text-ink" : "text-ink-muted")}>
          {selected ? "使用中：下方的分隊以這個方案預填" : "點選整格以這個方案預填"}
        </p>
      )}
    </li>
  );
}

/** The candidates side by side; only the manager's cards select one. */
export function CandidateList({
  matchId,
  candidates,
  selected,
  selectable,
}: {
  matchId: string;
  candidates: TeamCandidate[];
  selected: number | null;
  selectable: boolean;
}) {
  return (
    <Spotlight>
      <ol className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {candidates.map((c, i) => (
          <CandidateCard
            key={i}
            candidate={c}
            index={i}
            selected={i === selected}
            matchId={matchId}
            selectable={selectable}
          />
        ))}
      </ol>
    </Spotlight>
  );
}

/** "18:42" in Taiwan time. */
function clock(iso: string): string {
  return new Intl.DateTimeFormat("zh-TW", {
    timeZone: "Asia/Taipei",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

/** Where the last start got to, in words, so a manager can tell a slow server from a stuck one. */
function SessionSteps({ session }: { session: MatchServerSession }) {
  const steps = [
    { at: session.createdAt, text: `${session.startedBy} 開打（${session.serverName ?? "伺服器"}）` },
    { at: session.scriptRunAt, text: "伺服器沒有回應，已執行啟動腳本" },
    { at: session.rconSentAt, text: "已送出載入比賽的指令" },
    { at: session.configFetchedAt, text: "伺服器已拿到比賽設定" },
    { at: session.liveAt, text: "正式開打" },
  ].filter((step): step is { at: string; text: string } => step.at !== null);
  return (
    <ol className="border-t border-line">
      {steps.map((step) => (
        <li key={step.text} className="flex gap-4 border-b border-line py-2 text-body text-ink">
          <span className="font-mono text-label text-ink-secondary tabular-nums">{clock(step.at)}</span>
          {step.text}
        </li>
      ))}
      {session.status === "starting" && (
        <li className="py-2 text-caption text-ink-muted">{`期限 ${clock(session.deadlineAt)}（台灣時間），超過就會回到地圖已決定。`}</li>
      )}
    </ol>
  );
}

/**
 * The manager's main step for the current status, shown in the middle of the match room: lock (and
 * import the party), generate the candidates, pick and confirm the teams, start the veto, ban for a
 * team, start on a server (with the last failure), and the server's progress. Renders nothing when
 * the status has no such step; the backend still checks every one.
 */
export function StageActions({
  match,
  candidate,
  servers,
}: {
  match: ManagedMatch;
  candidate: string | string[] | undefined;
  /** The scrim servers to start on, fetched while the map is decided. */
  servers?: ScrimServerOption[] | null;
}) {
  const session = match.serverSession;
  const veto = match.veto;
  const onServer = ON_SERVER.includes(match.status);
  const banOptions = (veto?.maps ?? [])
    .filter((map) => !map.bannedBy)
    .map((map) => ({ value: map.key, label: map.name }));
  const turnName = veto?.turn && match.teams ? match.teams[veto.turn].name : `${veto?.turn ?? ""} 隊`;

  if (match.status === "lobby") {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-body text-ink-secondary">名單恰好 10 人時才能鎖定；鎖定後就不能再報名或退出。</p>
        <div className="flex flex-wrap items-start gap-4">
          <LockButton matchId={match.id} />
          {match.party && <ImportPartyButton matchId={match.id} />}
        </div>
      </div>
    );
  }
  if (match.status === "roster_locked") return <GenerateTeamsButton matchId={match.id} />;
  if (match.status === "team_draft" && match.candidates && match.candidates.length > 0) {
    return <TeamDraft match={match} candidates={match.candidates} candidate={candidate} />;
  }
  if (match.status === "teams_confirmed") {
    return (
      <div className="flex flex-col gap-4">
        <Heading level={3}>開始 Ban 圖</Heading>
        <VetoStartForm matchId={match.id} />
      </div>
    );
  }
  if (match.status === "veto_active" && veto?.step) {
    return (
      <div className="flex flex-col gap-4">
        <Heading level={3}>{`代 ${turnName} Ban`}</Heading>
        <p className="text-body text-ink-secondary">
          輪到的隊伍需要協助時，可以替他們 Ban 指定的地圖，或隨機 Ban 一張；時間到系統也會自動隨機 Ban。
        </p>
        <ManagerBanForm matchId={match.id} step={veto.step} maps={banOptions} />
      </div>
    );
  }
  if (match.status === "veto_complete") {
    return (
      <div className="flex flex-col gap-4">
        <Heading level={3}>開打</Heading>
        <p className="text-body text-ink-secondary">
          選一台伺服器，網站會在它沒開時自動啟動、載入兩隊名單與這張地圖；玩家在這頁按「進入遊戲」就會分到自己的隊伍。
        </p>
        {session?.status === "failed" && session.error && (
          <p role="alert" className="text-body text-destructive">{`上一次開打失敗：${session.error}`}</p>
        )}
        <ServerStartForm matchId={match.id} servers={servers ?? []} />
      </div>
    );
  }
  if (onServer && session) {
    return (
      <div className="flex flex-col gap-3">
        <Heading level={3}>伺服器進度</Heading>
        <SessionSteps session={session} />
      </div>
    );
  }
  return null;
}

const ON_SERVER: readonly ManagedMatch["status"][] = ["server_starting", "server_ready", "in_game"];

/**
 * The creating member's management area below the match room: the group invite codes, the manual
 * score, and the steps that undo something. The main step of each status sits in the room
 * (StageActions). Destructive steps need a ticked box; the backend still checks every step.
 */
export function MatchManage({ match }: { match: ManagedMatch }) {
  const players = match.entries.flatMap((entry) => entry.players);
  const options = players.map((player) => ({ value: player.playerId, label: player.name }));
  const groups = match.entries.filter((entry) => entry.isGroup);
  const unlockable = match.status === "roster_locked" || match.status === "team_draft";
  const removable = match.status === "lobby" && options.length > 0;
  const vetoing = match.status === "veto_active" || match.status === "veto_complete";
  const unconfirmable = match.status === "teams_confirmed";
  const onServer = ON_SERVER.includes(match.status);
  const scoreable = match.status === "veto_complete" || onServer || match.status === "completed";
  const veto = match.veto;
  const leftColumn = removable || unlockable || vetoing || unconfirmable || onServer;

  return (
    <div className="flex flex-col gap-10">
      {groups.length > 0 && (
        <div className="flex flex-col gap-3">
          <Heading level={3}>小隊邀請碼</Heading>
          <ul className="border-t border-line">
            {groups.map((entry, i) => (
              <li key={entry.id} className="flex justify-between gap-4 border-b border-line py-3 text-body text-ink">
                <span>{`小隊 ${i + 1}（${entry.players.length} 人）`}</span>
                <span className="font-mono tracking-widest">{entry.inviteCode}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {scoreable && (
        <div className="flex flex-col gap-3">
          <Heading level={3}>{match.status === "completed" ? "更正比分" : "手動輸入比分"}</Heading>
          <p className="text-body text-ink-secondary">伺服器沒辦法回傳結果時使用；手動輸入的場次沒有玩家數據。</p>
          <MatchResultForm matchId={match.id} completed={match.status === "completed"} />
        </div>
      )}

      {/* The steps that undo something, side by side below a rule: removing a player (while signing
          up is open), unlocking (once locked), taking confirmed teams back, or undo and reset (during the
          veto) on the left, cancelling on the right. */}
      {match.status !== "cancelled" && match.status !== "completed" && (
        <div className="grid grid-cols-1 gap-8 border-t border-line pt-6 md:grid-cols-2">
          {removable && (
            <div className="flex flex-col gap-3">
              <Heading level={3}>移出玩家</Heading>
              <RemovePlayerForm matchId={match.id} players={options} />
            </div>
          )}
          {unlockable && (
            <div className="flex flex-col gap-3">
              <Heading level={3}>解除鎖定</Heading>
              <UnlockForm matchId={match.id} />
            </div>
          )}
          {unconfirmable && (
            <div className="flex flex-col gap-3">
              <Heading level={3}>退回分隊</Heading>
              <UnconfirmTeamsForm matchId={match.id} />
            </div>
          )}
          {onServer && (
            <div className="flex flex-col gap-3">
              <Heading level={3}>中止比賽</Heading>
              <ServerAbortForm matchId={match.id} />
            </div>
          )}
          {vetoing && (
            <div className="flex flex-col gap-6">
              {veto && veto.bans.length > 0 && (
                <div className="flex flex-col gap-3">
                  <Heading level={3}>撤銷</Heading>
                  <VetoUndoForm matchId={match.id} />
                </div>
              )}
              <div className="flex flex-col gap-3">
                <Heading level={3}>重設 Ban 圖</Heading>
                <VetoResetForm matchId={match.id} />
              </div>
            </div>
          )}
          <div className={cn("flex flex-col gap-3", leftColumn && "md:border-l md:border-line md:pl-8")}>
            <Heading level={3}>取消場次</Heading>
            <CancelMatchForm matchId={match.id} />
          </div>
        </div>
      )}
    </div>
  );
}

function TeamDraft({
  match,
  candidates,
  candidate,
}: {
  match: ManagedMatch;
  candidates: TeamCandidate[];
  candidate: string | string[] | undefined;
}) {
  const selected = candidateIndex(candidate, candidates.length);
  const chosen = candidates[selected];
  const ratingOf = new Map(
    candidates.flatMap((c) => [...c.teamA.players, ...c.teamB.players]).map((p) => [p.playerId, p.rating ?? 0]),
  );
  const groupNumber = new Map(
    match.entries.filter((entry) => entry.isGroup).map((entry, i) => [entry.id, `小隊 ${i + 1}`]),
  );
  const players: TeamPlayer[] = match.entries.flatMap((entry) =>
    entry.players.map((player) => ({
      playerId: player.playerId,
      name: player.name,
      rating: ratingOf.get(player.playerId) ?? player.rating ?? 0,
      group: groupNumber.get(entry.id) ?? null,
    })),
  );
  const teamOf: Record<string, "A" | "B"> = Object.fromEntries([
    ...chosen.teamA.playerIds.map((id) => [id, "A"] as const),
    ...chosen.teamB.playerIds.map((id) => [id, "B"] as const),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <Heading level={3} id="team-candidates">
          分隊候選
        </Heading>
        <p className="text-body text-ink-secondary">依每位玩家目前的評分計算，不會拆開小隊；總分差越小越平均。</p>
        <CandidateList matchId={match.id} candidates={candidates} selected={selected} selectable />
      </div>
      <div className="flex flex-col gap-4">
        <Heading level={3} id="confirm-teams-title">
          確認分隊
        </Heading>
        <TeamConfirmForm
          key={selected}
          matchId={match.id}
          players={players}
          teamOf={teamOf}
          captainA={chosen.teamA.suggestedCaptain}
          captainB={chosen.teamB.suggestedCaptain}
        />
      </div>
    </div>
  );
}
