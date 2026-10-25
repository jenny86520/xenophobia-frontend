import Link from "next/link";
import { Heading } from "@/components/brand/typography";
import { cn } from "@/lib/utils";
import type { ManagedMatch, TeamCandidate } from "@/types/match";
import {
  CancelMatchForm,
  GenerateTeamsButton,
  ImportPartyButton,
  LockButton,
  RemovePlayerForm,
  TeamConfirmForm,
  type TeamPlayer,
  UnlockForm,
} from "./match-forms";

/** "?candidate=2" → index 1; anything else picks the best (first) candidate. */
export function candidateIndex(value: string | string[] | undefined, count: number): number {
  const n = Number(Array.isArray(value) ? value[0] : value);
  return Number.isInteger(n) && n >= 1 && n <= count ? n - 1 : 0;
}

/**
 * One candidate. The whole card is one link (its title stretched over the card) that selects it and
 * presets the team form below; the page stays at the candidates. Works without JavaScript.
 */
function CandidateCard({
  candidate,
  index,
  selected,
  matchId,
}: {
  candidate: TeamCandidate;
  index: number;
  selected: boolean;
  matchId: string;
}) {
  return (
    <li
      className={cn(
        "relative flex flex-col gap-4 rounded-sm border p-4 transition-colors",
        "has-[a:focus-visible]:ring-3 has-[a:focus-visible]:ring-ring/50",
        selected ? "border-signal bg-surface-elevated" : "border-line hover:border-line-strong",
      )}
    >
      <div className="flex items-baseline justify-between gap-4">
        <h4 className="font-heading text-h3 text-ink">
          <Link
            href={`/matches/${matchId}?candidate=${index + 1}#team-candidates`}
            scroll={false}
            aria-current={selected ? "true" : undefined}
            className="after:absolute after:inset-0 focus-visible:outline-none"
          >
            {`方案 ${index + 1}`}
          </Link>
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
                  className="flex items-baseline justify-between gap-4 border-b border-line py-2 text-body text-ink"
                >
                  <span>{player.name}</span>
                  <span className="font-mono text-label text-ink-secondary tabular-nums">{player.rating}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
      <p className={cn("text-caption", selected ? "text-ink" : "text-ink-muted")}>
        {selected ? "使用中：下方的分隊以這個方案預填" : "點選整格以這個方案預填"}
      </p>
    </li>
  );
}

/**
 * The creating member's management area on the match page. Which tools show depends on the
 * status; the backend still checks every step. Destructive steps need a ticked box.
 */
export function MatchManage({ match, candidate }: { match: ManagedMatch; candidate: string | string[] | undefined }) {
  const players = match.entries.flatMap((entry) => entry.players);
  const options = players.map((player) => ({ value: player.playerId, label: player.name }));
  const groups = match.entries.filter((entry) => entry.isGroup);
  const unlockable = match.status === "roster_locked" || match.status === "team_draft";
  const removable = match.status === "lobby" && options.length > 0;

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

      {match.status === "lobby" && (
        <div className="flex flex-col gap-6">
          <p className="text-body text-ink-secondary">名單恰好 10 人時才能鎖定；鎖定後就不能再報名或退出。</p>
          <div className="flex flex-wrap items-start gap-4">
            <LockButton matchId={match.id} />
            {match.party && <ImportPartyButton matchId={match.id} />}
          </div>
        </div>
      )}

      {match.status === "roster_locked" && <GenerateTeamsButton matchId={match.id} />}

      {match.status === "team_draft" && match.candidates && match.candidates.length > 0 && (
        <TeamDraft match={match} candidates={match.candidates} candidate={candidate} />
      )}

      {/* The steps that undo something, side by side below a rule: removing a player (while signing
          up is open) or unlocking (once locked) on the left, cancelling on the right. */}
      {match.status !== "cancelled" && (
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
          <div className={cn("flex flex-col gap-3", (removable || unlockable) && "md:border-l md:border-line md:pl-8")}>
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
    candidates.flatMap((c) => [...c.teamA.players, ...c.teamB.players]).map((p) => [p.playerId, p.rating]),
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
        <ol className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {candidates.map((c, i) => (
            <CandidateCard key={i} candidate={c} index={i} selected={i === selected} matchId={match.id} />
          ))}
        </ol>
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
