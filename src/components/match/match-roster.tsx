import { Crown } from "lucide-react";
import { Heading } from "@/components/brand/typography";
import type { MatchDetail, MatchPlayer } from "@/types/match";

/** A player's name with their rating when the viewer may see it, and the captain mark. */
function PlayerLine({ player, showRating }: { player: MatchPlayer; showRating: boolean }) {
  return (
    <li className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-line py-3">
      <span className="inline-flex items-center gap-2 text-body text-ink">
        {player.isCaptain && (
          <>
            <Crown aria-hidden="true" className="size-4 text-signal" />
            <span className="sr-only">隊長</span>
          </>
        )}
        {player.name}
      </span>
      {showRating && player.rating !== undefined && (
        <span className="font-mono text-label text-ink-secondary tabular-nums">{player.rating}</span>
      )}
    </li>
  );
}

/**
 * The roster grouped by sign-up (groups first labelled with their size, solo players after), or,
 * once the teams are confirmed, the two teams with captains, totals and the difference. Ratings
 * only appear in the signed-in view (the public view has none).
 */
export function MatchRoster({ match }: { match: MatchDetail }) {
  const players = match.entries.flatMap((entry) => entry.players);
  const showRating = players.some((player) => player.rating !== undefined);
  const byId = new Map(players.map((player) => [player.playerId, player]));

  if (match.teams) {
    const { teams } = match;
    return (
      <div className="flex flex-col gap-8">
        <p className="text-lead text-ink">
          總分差 <span className="font-mono tabular-nums">{teams.difference}</span>
        </p>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {(["A", "B"] as const).map((side) => (
            <section key={side} aria-labelledby={`team-${side}-title`} className="flex flex-col gap-3">
              <Heading level={3} id={`team-${side}-title`}>
                {side} 隊
              </Heading>
              <p className="font-mono text-label text-ink-secondary tabular-nums">
                總分 {teams[side].total}・平均 {teams[side].average}
              </p>
              <ul className="border-t border-line">
                {teams[side].playerIds.map((id) => {
                  const player = byId.get(id);
                  return player ? <PlayerLine key={id} player={player} showRating={showRating} /> : null;
                })}
              </ul>
            </section>
          ))}
        </div>
      </div>
    );
  }

  if (players.length === 0) {
    return <p className="text-body text-ink-secondary">目前還沒有人報名。</p>;
  }
  const groups = match.entries.filter((entry) => entry.isGroup);
  const solos = match.entries.filter((entry) => !entry.isGroup);
  return (
    <div className="flex flex-col gap-8">
      {groups.map((entry, i) => (
        <section key={entry.id} aria-labelledby={`group-${entry.id}`} className="flex flex-col gap-3">
          <Heading level={3} id={`group-${entry.id}`}>
            {`小隊 ${i + 1}（${entry.players.length} 人）`}
          </Heading>
          <ul className="border-t border-line">
            {entry.players.map((player) => (
              <PlayerLine key={player.playerId} player={player} showRating={showRating} />
            ))}
          </ul>
        </section>
      ))}
      {solos.length > 0 && (
        <section aria-labelledby="solo-title" className="flex flex-col gap-3">
          <Heading level={3} id="solo-title">
            {`單人報名（${solos.length} 人）`}
          </Heading>
          <ul className="border-t border-line">
            {solos
              .flatMap((entry) => entry.players)
              .map((player) => (
                <PlayerLine key={player.playerId} player={player} showRating={showRating} />
              ))}
          </ul>
        </section>
      )}
    </div>
  );
}
