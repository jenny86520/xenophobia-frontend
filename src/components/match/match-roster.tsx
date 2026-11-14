import { Heading } from "@/components/brand/typography";
import { frameRow } from "@/components/cosmetics/frame";
import type { MatchDetail, MatchPlayer } from "@/types/match";
import { PlayerLineItems } from "@/components/match/player-line";

/**
 * A player's name with their rating when the viewer may see it, the captain mark, and a member's
 * equipped title and frame (spec member-cosmetics; guests have none).
 */
function PlayerLine({
  player,
  showRating,
}: {
  player: MatchPlayer;
  showRating: boolean;
}) {
  return (
    <li {...frameRow(player.frame, "border-b border-line py-3")}>
      <PlayerLineItems
        player={player}
        idPrefix={`roster-${player.playerId}`}
        rating={showRating ? player.rating : undefined}
      />
    </li>
  );
}

/**
 * The roster grouped by sign-up (groups first labelled with their size, solo players after), shown
 * in the match room until the teams are confirmed (then the room shows the two teams). Ratings
 * only appear in the signed-in view (the public view has none).
 */
export function MatchRoster({ match }: { match: MatchDetail }) {
  const players = match.entries.flatMap((entry) => entry.players);
  const showRating = players.some((player) => player.rating !== undefined);

  if (players.length === 0) {
    return <p className="text-body text-ink-secondary">目前還沒有人報名。</p>;
  }
  const groups = match.entries.filter((entry) => entry.isGroup);
  const solos = match.entries.filter((entry) => !entry.isGroup);
  return (
    <div className="flex flex-col gap-8">
      {groups.map((entry, i) => (
        <section
          key={entry.id}
          aria-labelledby={`group-${entry.id}`}
          className="flex flex-col gap-3"
        >
          <Heading level={3} id={`group-${entry.id}`}>
            {`小隊 ${i + 1}（${entry.players.length} 人）`}
          </Heading>
          <ul className="border-t border-line">
            {entry.players.map((player) => (
              <PlayerLine
                key={player.playerId}
                player={player}
                showRating={showRating}
              />
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
                <PlayerLine
                  key={player.playerId}
                  player={player}
                  showRating={showRating}
                />
              ))}
          </ul>
        </section>
      )}
    </div>
  );
}
