import { TextLink } from "@/components/brand/text-link";
import type { RatingHistory } from "@/types/match";
import { formatTaipeiDateTime } from "@/utils/datetime";
import { ratingBreakdown, signedPoints } from "@/utils/rating";

/**
 * A player's own rating changes, newest first: each rated match (linked, with where the points
 * came from) and each adjustment by an admin. Hairline rows, the points in mono.
 */
export function RatingHistoryList({ changes, label }: { changes: RatingHistory["changes"]; label: string }) {
  if (changes.length === 0) {
    return <p className="text-body text-ink-secondary">還沒有評分變動；打完第一場已計分的內戰後就會出現。</p>;
  }
  return (
    <ol aria-label={label} className="border-t border-line">
      {changes.map((change, i) => (
        <li
          key={`${change.at}-${i}`}
          className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-line py-3"
        >
          <span className="flex flex-col gap-0.5">
            <span className="text-body text-ink">
              {change.match ? <TextLink href={`/matches/${change.match.id}`}>{change.match.title}</TextLink> : "管理員調整"}
            </span>
            <span className="text-caption text-ink-secondary">
              {formatTaipeiDateTime(change.at)}
              {change.kind === "match" && change.teamPart !== null && (
                <>
                  ・
                  {ratingBreakdown({
                    teamPart: change.teamPart,
                    personalPart: change.personalPart ?? 0,
                    note: change.note,
                  })}
                </>
              )}
            </span>
          </span>
          <span className="font-mono text-label text-ink tabular-nums">
            {signedPoints(change.delta)}
            <span className="ml-2 text-ink-muted">{`${change.before} → ${change.after}`}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}
