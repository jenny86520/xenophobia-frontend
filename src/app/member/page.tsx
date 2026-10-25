import type { Metadata } from "next";
import { CtaLink } from "@/components/brand/cta-link";
import { formatCount, MetaLabel } from "@/components/brand/meta-label";
import { PageHeader } from "@/components/brand/page-header";
import { Section } from "@/components/brand/section";
import { TextLink } from "@/components/brand/text-link";
import { NicknameForm } from "@/components/member/member-forms";
import { MemberMatchesPanel } from "@/components/match/member-matches-panel";
import { MemberTabPanel, MemberTabs } from "@/components/member/member-tabs";
import { MemberVideosPanel } from "@/components/member/member-videos-panel";
import { MemberSteam } from "@/components/player/member-steam";
import { fetchMemberMatches, fetchMemberProfile, fetchMemberVideoSubmissions } from "@/lib/member-session";
import { fetchAboutContent } from "@/lib/public-content-client";
import type { MemberProfile } from "@/types/member";
import { parseMemberTab, type MemberTab } from "@/utils/member-tabs";
import { logoutAction } from "./actions";

export const metadata: Metadata = {
  title: "Member",
  description: "XenoPhobiA 會員頁：個人資料、參加的活動、內戰場次與投稿影片。",
};

/**
 * Members-only: the profile, then tabs (?tab=) for joined parties, the nickname and video
 * submissions; everyone else sees how to become a member. Only the open tab's data is fetched.
 */
export default async function MemberPage({ searchParams }: PageProps<"/member">) {
  const profile = await fetchMemberProfile();

  if (!profile) {
    return (
      <main id="main">
        <Section spacing="tight" labelledBy="page-title">
          <PageHeader
            eyebrow="MEMBER / ONLY"
            title="會員專區"
            description="此頁僅限會員，請聯絡管理員開通。已開通的會員請先登入。"
            actions={
              <>
                <CtaLink href="/member/login" label="會員登入" />
                <CtaLink href="/member/register" label="註冊會員" variant="secondary" />
              </>
            }
          />
        </Section>
      </main>
    );
  }

  const query = await searchParams;
  const tab = parseMemberTab(query.tab);
  const details = [
    { label: "會員編號", value: profile.memberCode ?? "—" },
    { label: "姓名", value: profile.name },
    { label: "暱稱", value: profile.nickname },
    { label: "帳號", value: profile.username },
    { label: "Discord ID", value: profile.discordId },
    { label: "Email", value: profile.email },
    { label: "手機", value: profile.phone },
    { label: "角色", value: profile.role?.name ?? "—" },
  ];

  return (
    <main id="main">
      <Section spacing="tight" labelledBy="page-title">
        <PageHeader
          eyebrow={`MEMBER / ${profile.memberCode ?? "PROFILE"}`}
          title={profile.nickname}
          actions={
            <form action={logoutAction}>
              <button type="submit" className="link-underline text-body text-ink-secondary hover:text-ink">
                登出
              </button>
            </form>
          }
        />
        <dl className="mt-section-tight grid grid-cols-1 border-t border-line md:grid-cols-2 lg:grid-cols-4">
          {details.map((item) => (
            <div key={item.label} className="flex flex-col gap-1 border-b border-line py-4 md:pr-6">
              <dt>
                <MetaLabel>{item.label}</MetaLabel>
              </dt>
              <dd className="text-lead break-all text-ink">{item.value}</dd>
            </div>
          ))}
        </dl>
        <MemberSteam steam={profile.steam} result={typeof query.steam === "string" ? query.steam : undefined} />
      </Section>

      <Section spacing="tight">
        <MemberTabs current={tab} />
        {await tabContent(tab, profile)}
      </Section>
    </main>
  );
}

/** The open tab's content; only that tab's data is fetched. */
async function tabContent(tab: MemberTab, profile: MemberProfile) {
  if (tab === "nickname") {
    return (
      <MemberTabPanel id="nickname-title" eyebrow="Profile" title="修改暱稱">
        <NicknameForm nickname={profile.nickname} />
      </MemberTabPanel>
    );
  }

  if (tab === "matches") {
    const matches = (await fetchMemberMatches()) ?? { steamLinked: false, rating: null, items: [] };
    return <MemberMatchesPanel matches={matches} />;
  }

  if (tab === "videos") {
    const submissions = (await fetchMemberVideoSubmissions()) ?? {
      items: [],
      paused: false,
      canSubmit: false,
      uploadsLeftToday: 0,
    };
    const games = submissions.canSubmit ? ((await fetchAboutContent())?.games ?? []) : [];
    return (
      <MemberVideosPanel submissions={submissions} games={games.map((game) => ({ id: game.id, name: game.name }))} />
    );
  }

  return (
    <MemberTabPanel id="joined-title" eyebrow={`Joined / ${formatCount(profile.parties.length)}`} title="參加的活動">
      {profile.parties.length === 0 ? (
        <p className="text-body text-ink-secondary">
          還沒有報名任何活動。<TextLink href="/party">看看有哪些活動</TextLink>
        </p>
      ) : (
        <ol className="border-t border-line">
          {profile.parties.map((party) => (
            <li
              key={party.id}
              className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-line py-4"
            >
              <TextLink href={`/party/${party.id}`} className="text-lead text-ink">
                {party.title}
              </TextLink>
              <MetaLabel>
                {party.startDate} {party.startTime}
              </MetaLabel>
            </li>
          ))}
        </ol>
      )}
    </MemberTabPanel>
  );
}
