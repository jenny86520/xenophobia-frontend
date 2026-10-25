import type { Metadata } from "next";
import { CtaLink } from "@/components/brand/cta-link";
import { formatCount, MetaLabel } from "@/components/brand/meta-label";
import { PageHeader } from "@/components/brand/page-header";
import { Section } from "@/components/brand/section";
import { MatchRow } from "@/components/match/match-row";
import { fetchMemberProfile } from "@/lib/member-session";
import { fetchMatches } from "@/lib/public-content-client";

export const metadata: Metadata = {
  title: "Matches",
  description: "XenoPhobiA 的 CS2 十人內戰場次：報名、組隊與分隊結果。",
};

/** Scrim matches, open ones first. Members who may create matches get 建立場次. */
export default async function MatchesPage() {
  const [matches, member] = await Promise.all([fetchMatches(), fetchMemberProfile()]);

  return (
    <main id="main">
      <Section spacing="tight" labelledBy="page-title">
        <PageHeader
          eyebrow="MATCHES / CS2"
          title="內戰場次"
          description="Counter-Strike 2 專用的十人內戰：會員綁定 Steam、或以 Steam 登入的訪客都能報名，可以單人或用邀請碼組小隊；湊滿十人後依評分分成兩隊。"
          actions={member?.canCreateMatch ? <CtaLink href="/matches/new" label="建立場次" /> : undefined}
        />
      </Section>

      <Section spacing="none" className="pb-section">
        <p>
          <MetaLabel>Matches / {formatCount(matches.total)}</MetaLabel>
        </p>
        {matches.items.length === 0 ? (
          <p className="mt-6 border-t border-line pt-8 text-lead text-ink-secondary">目前還沒有場次。</p>
        ) : (
          <ul className="mt-6 border-b border-line">
            {matches.items.map((match) => (
              <MatchRow key={match.id} match={match} titleAs="h2" />
            ))}
          </ul>
        )}
      </Section>
    </main>
  );
}
