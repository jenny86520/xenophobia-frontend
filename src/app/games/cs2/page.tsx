import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPinned } from "lucide-react";
import { formatCount, MetaLabel } from "@/components/brand/meta-label";
import { PageHeader } from "@/components/brand/page-header";
import { Section } from "@/components/brand/section";
import { TextLink } from "@/components/brand/text-link";
import { Heading } from "@/components/brand/typography";
import { SteamLoginLink } from "@/components/player/steam-login-link";
import { fetchScrimLadder } from "@/lib/player-actor";
import { fetchRecentScrims } from "@/lib/public-content-client";
import type { CompletedMatch, LadderEntry } from "@/types/match";
import { formatTaipeiDateTime } from "@/utils/datetime";

export const metadata: Metadata = {
  title: "Counter-Strike 2",
  description: "XenoPhobiA 的 CS2 內戰：評分排行與最近完成的比賽。",
};

/** The ladder for signed-in people: place, name, rating, rated matches and wins. */
function Ladder({ entries }: { entries: LadderEntry[] }) {
  if (entries.length === 0) {
    return <p className="text-body text-ink-secondary">還沒有已計分的場次，打完第一場內戰後就會出現排行。</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-body">
        <caption className="sr-only">評分排行</caption>
        <thead>
          <tr className="border-b border-line text-left text-caption text-ink-muted">
            <th scope="col" className="py-2 pr-4 font-normal">
              名次
            </th>
            <th scope="col" className="py-2 pr-4 font-normal">
              玩家
            </th>
            <th scope="col" className="py-2 pr-4 text-right font-normal">
              評分
            </th>
            <th scope="col" className="py-2 pr-4 text-right font-normal">
              場數
            </th>
            <th scope="col" className="py-2 text-right font-normal">
              勝場
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.playerId} className="border-b border-line text-ink">
              <td className="py-3 pr-4 font-mono text-label text-ink-secondary tabular-nums">{entry.place}</td>
              <th scope="row" className="py-3 pr-4 text-left font-normal">
                {entry.name}
              </th>
              <td className="py-3 pr-4 text-right font-mono tabular-nums">{entry.rating}</td>
              <td className="py-3 pr-4 text-right font-mono text-ink-secondary tabular-nums">{entry.matches}</td>
              <td className="py-3 text-right font-mono text-ink-secondary tabular-nums">{entry.wins}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** One finished match: title, map, both teams with the score, the winner and when; links to it. */
function ResultRow({ match }: { match: CompletedMatch }) {
  const score = match.scoreA !== null && match.scoreB !== null ? `${match.scoreA} : ${match.scoreB}` : "—";
  const result = match.winner ? `${match.teams[match.winner]}獲勝` : "平手";
  return (
    <li className="list-row border-t border-line">
      <Link
        href={`/matches/${match.id}`}
        className="grid grid-cols-4 gap-x-4 gap-y-2 px-2 py-5 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none md:grid-cols-8 md:gap-x-6 lg:grid-cols-12"
      >
        <div className="col-span-4 flex flex-col gap-1 md:col-span-4 lg:col-span-5">
          <h3 className="font-heading text-h3 text-ink">{match.title}</h3>
          <MetaLabel>
            {[match.party?.title, match.completedAt && formatTaipeiDateTime(match.completedAt)].filter(Boolean).join("・")}
          </MetaLabel>
        </div>
        <div className="col-span-4 flex flex-col gap-1 md:col-span-4 lg:col-span-6">
          <p className="flex flex-wrap items-baseline gap-x-3 text-ink">
            <span className="text-body text-ink-secondary">{match.teams.A}</span>
            <span className="font-mono text-h3 tabular-nums">{score}</span>
            <span className="text-body text-ink-secondary">{match.teams.B}</span>
          </p>
          <p className="flex flex-wrap items-center gap-x-4 text-caption text-ink-secondary">
            <span>{result}</span>
            {match.mapName && (
              <span className="inline-flex items-center gap-1.5">
                <MapPinned aria-hidden="true" className="size-3.5 text-signal" />
                {match.mapName}
              </span>
            )}
          </p>
        </div>
        <div className="hidden items-start justify-end lg:col-span-1 lg:flex">
          <ArrowRight aria-hidden="true" className="list-row-arrow size-5 text-ink-muted" />
        </div>
      </Link>
    </li>
  );
}

/**
 * The CS2 game page: the rating ladder for signed-in people (members or Steam guests; visitors are
 * told how to sign in, as ratings are never public) and the newest finished matches for everyone.
 */
export default async function Cs2GamePage() {
  const [ladder, recent] = await Promise.all([fetchScrimLadder(), fetchRecentScrims()]);

  return (
    <main id="main">
      <Section spacing="tight" labelledBy="page-title">
        <PageHeader
          eyebrow="GAME / CS2"
          title="Counter-Strike 2"
          description="XPA 十人內戰的評分排行與最近的比賽。每場結束後依勝負與個人表現加減分，參加過已計分的場次就會列入排行。"
          actions={<TextLink href="/matches">內戰場次</TextLink>}
        />
      </Section>

      <Section spacing="tight" labelledBy="ladder-title" ruled>
        <div className="flex flex-col gap-6">
          <Heading level={2} id="ladder-title">
            評分排行
          </Heading>
          {ladder ? (
            <Ladder entries={ladder} />
          ) : (
            <div className="flex flex-col gap-4">
              <p className="text-body text-ink-secondary">評分只給已登入的人看：以 Steam 登入，或登入會員後就能看到排行。</p>
              <div className="flex flex-wrap items-center gap-6">
                <SteamLoginLink intent="guest" label="以 Steam 登入" />
                <TextLink href="/member/login">會員登入</TextLink>
              </div>
            </div>
          )}
        </div>
      </Section>

      <Section spacing="tight" labelledBy="recent-title" ruled>
        <div className="flex flex-col gap-4">
          <Heading level={2} id="recent-title">
            最近的比賽
          </Heading>
          <p>
            <MetaLabel>Results / {formatCount(recent.length)}</MetaLabel>
          </p>
          {recent.length === 0 ? (
            <p className="text-body text-ink-secondary">還沒有完成的比賽。</p>
          ) : (
            <ul aria-label="最近的比賽" className="border-b border-line">
              {recent.map((match) => (
                <ResultRow key={match.id} match={match} />
              ))}
            </ul>
          )}
        </div>
      </Section>
    </main>
  );
}
