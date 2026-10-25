import { formatCount, MetaLabel } from "@/components/brand/meta-label";
import { TextLink } from "@/components/brand/text-link";
import { MemberTabPanel } from "@/components/member/member-tabs";
import type { MemberMatches } from "@/types/match";
import { MatchRow } from "./match-row";

/** The member page's 內戰場次 tab: the member's rating, the matches they are on, and a way to all matches. */
export function MemberMatchesPanel({ matches }: { matches: MemberMatches }) {
  return (
    <MemberTabPanel id="matches-title" eyebrow={`Matches / ${formatCount(matches.items.length)}`} title="內戰場次">
      {!matches.steamLinked ? (
        <p className="text-body text-ink-secondary">
          參加內戰與評分需要先綁定 Steam 帳號，請在上方的「Steam 帳號」綁定。
        </p>
      ) : (
        <>
          <dl className="flex flex-col gap-1 border-b border-line pb-6">
            <dt>
              <MetaLabel>我的評分</MetaLabel>
            </dt>
            <dd className="font-mono text-h2 text-ink tabular-nums">{matches.rating}</dd>
          </dl>
          {matches.items.length === 0 ? (
            <p className="text-body text-ink-secondary">還沒有參加任何內戰場次。</p>
          ) : (
            <ul aria-label="參加的內戰場次" className="border-b border-line">
              {matches.items.map((match) => (
                <MatchRow
                  key={match.id}
                  match={match}
                  note={match.team ? `${match.team} 隊${match.isCaptain ? "・隊長" : ""}` : undefined}
                />
              ))}
            </ul>
          )}
        </>
      )}
      <p className="text-body">
        <TextLink href="/matches">查看所有內戰場次</TextLink>
      </p>
    </MemberTabPanel>
  );
}
