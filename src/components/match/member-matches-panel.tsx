import { formatCount, MetaLabel } from "@/components/brand/meta-label";
import { TextLink } from "@/components/brand/text-link";
import { MemberTabPanel } from "@/components/member/member-tabs";
import type { MemberMatches } from "@/types/match";
import { Heading } from "@/components/brand/typography";
import { signedPoints } from "@/utils/rating";
import { MatchRow } from "./match-row";
import { RatingHistoryList } from "./rating-history";

/** Beside a match: the member's team and, once rated, their change ("A 隊・隊長・評分 +28"). */
function noteOf(match: MemberMatches["items"][number]): string | undefined {
  const parts = [
    match.team && `${match.team} 隊${match.isCaptain ? "・隊長" : ""}`,
    match.ratingChange && `評分 ${signedPoints(match.ratingChange.delta)}`,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join("・") : undefined;
}

/**
 * The member page's 內戰場次 tab: the member's rating in the left column under the heading, the
 * matches they are on (with their change once rated), admins' adjustments, and ways to all matches
 * and the rating ladder on the right.
 */
export function MemberMatchesPanel({ matches }: { matches: MemberMatches }) {
  return (
    <MemberTabPanel
      id="matches-title"
      eyebrow={`Matches / ${formatCount(matches.items.length)}`}
      title="內戰場次"
      aside={
        matches.steamLinked && (
          <dl className="mt-4 flex flex-col gap-1 border-t border-line pt-6">
            <dt>
              <MetaLabel>我的評分</MetaLabel>
            </dt>
            <dd className="font-mono text-h2 text-ink tabular-nums">{matches.rating}</dd>
          </dl>
        )
      }
    >
      {!matches.steamLinked ? (
        <p className="text-body text-ink-secondary">
          參加內戰與評分需要先綁定 Steam 帳號，請在上方的「Steam 帳號」綁定。
        </p>
      ) : (
        <>
          {matches.items.length === 0 ? (
            <p className="text-body text-ink-secondary">還沒有參加任何內戰場次。</p>
          ) : (
            <ul aria-label="參加的內戰場次" className="border-b border-line">
              {matches.items.map((match) => (
                <MatchRow key={match.id} match={match} note={noteOf(match)} />
              ))}
            </ul>
          )}
          {matches.adjustments.length > 0 && (
            <div className="flex flex-col gap-3">
              <Heading level={3}>管理員調整</Heading>
              <RatingHistoryList
                label="管理員調整"
                changes={matches.adjustments.map((a) => ({
                  ...a,
                  kind: "manual" as const,
                  teamPart: null,
                  personalPart: null,
                  note: null,
                  match: null,
                }))}
              />
            </div>
          )}
        </>
      )}
      <p className="flex flex-wrap gap-6 text-body">
        <TextLink href="/matches">查看所有內戰場次</TextLink>
        <TextLink href="/games/cs2">評分排行</TextLink>
      </p>
    </MemberTabPanel>
  );
}
