import type { Metadata } from "next";
import { CtaLink } from "@/components/brand/cta-link";
import { formatCount, MetaLabel } from "@/components/brand/meta-label";
import { PageHeader } from "@/components/brand/page-header";
import { Section } from "@/components/brand/section";
import { TextLink } from "@/components/brand/text-link";
import { NicknameForm } from "@/components/member/member-forms";
import { MemberMatchesPanel } from "@/components/match/member-matches-panel";
import { MemberTabPanel, MemberTabs } from "@/components/member/member-tabs";
import { MemberFriendsPanel } from "@/components/member/member-friends-panel";
import { LegalConsentPanel } from "@/components/member/legal-consent-panel";
import { MemberPointsPanel } from "@/components/member/member-points-panel";
import { MemberVideosPanel } from "@/components/member/member-videos-panel";
import { MemberSteam } from "@/components/player/member-steam";
import {
  fetchMemberFriends,
  fetchMemberFriendSummary,
  fetchMemberLegalChanges,
  fetchMemberMatches,
  fetchMemberPoints,
  fetchMemberProfile,
  fetchMemberVideoSubmissions,
} from "@/lib/member-session";
import { fetchAboutContent } from "@/lib/public-content-client";
import type { MemberProfile } from "@/types/member";
import { parseMemberTab, type MemberTab } from "@/utils/member-tabs";
import { formatPartyTime, formatSubPartyRange } from "@/utils/party-time";
import { logoutAction } from "./actions";

export const metadata: Metadata = {
  title: "Member",
  description: "XenoPhobiA 會員頁：個人資料、參加的活動、內戰場次、好友、投稿影片與點數。",
};

/**
 * Members-only: the nickname, sign-out and Steam row, then tabs (?tab=) for the profile (details and
 * nickname form, the default), joined parties, scrims, friends, video submissions and points; everyone else sees how to become a member. Only the open tab's data is fetched.
 * While the member must agree to renewed terms, the consent panel (with what changed) replaces the tabs.
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
        <MemberSteam
          steam={profile.steam}
          result={typeof query.steam === "string" ? query.steam : undefined}
          createMatch={profile.canCreateMatch}
        />
      </Section>

      <Section spacing="tight">
        {profile.legalConsent.required ? (
          <LegalConsentPanel consent={profile.legalConsent} changes={await fetchMemberLegalChanges()} />
        ) : (
          <>
            <MemberTabs current={tab} counts={{ friends: await fetchMemberFriendSummary() }} />
            {await tabContent(tab, profile, query.page)}
          </>
        )}
      </Section>
    </main>
  );
}

/** The open tab's content; only that tab's data is fetched. */
async function tabContent(tab: MemberTab, profile: MemberProfile, page: string | string[] | undefined) {
  if (tab === "profile") {
    const details = [
      { label: "會員編號", value: profile.memberCode ?? "—" },
      { label: "稱呼", value: profile.name },
      { label: "暱稱", value: profile.nickname },
      { label: "帳號", value: profile.username },
      { label: "Discord ID", value: profile.discordId },
      { label: "Email", value: profile.email },
      { label: "手機", value: profile.phone },
      { label: "角色", value: profile.role?.name ?? "—" },
    ];
    return (
      <MemberTabPanel id="profile-title" eyebrow="Profile" title="個人資料">
        <dl className="grid grid-cols-1 border-t border-line md:grid-cols-2">
          {details.map((item) => (
            <div key={item.label} className="flex flex-col gap-1 border-b border-line py-4 md:pr-6">
              <dt>
                <MetaLabel>{item.label}</MetaLabel>
              </dt>
              <dd className="text-lead break-all text-ink">{item.value}</dd>
            </div>
          ))}
        </dl>
        <NicknameForm nickname={profile.nickname} />
      </MemberTabPanel>
    );
  }

  if (tab === "friends") {
    const overview = (await fetchMemberFriends()) ?? {
      memberCode: profile.memberCode,
      friends: [],
      incoming: [],
      outgoing: [],
      matchInvites: [],
    };
    return <MemberFriendsPanel overview={overview} />;
  }

  if (tab === "matches") {
    const matches = (await fetchMemberMatches()) ?? { steamLinked: false, rating: null, items: [], adjustments: [] };
    return <MemberMatchesPanel matches={matches} />;
  }

  if (tab === "points") {
    const pageNumber = typeof page === "string" && /^[1-9]\d*$/.test(page) ? Number(page) : 1;
    const points = (await fetchMemberPoints(pageNumber)) ?? {
      balance: 0,
      checkedInToday: false,
      campaign: null,
      entries: { items: [], total: 0, page: 1, pageSize: 20 },
    };
    return <MemberPointsPanel points={points} />;
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
      <MemberVideosPanel
        submissions={submissions}
        games={games.map((game) => ({ id: game.id, name: game.name }))}
        steamId={profile.steam?.steamId ?? null}
      />
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
            <li key={party.id} className="flex flex-col gap-2 border-b border-line py-4">
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                <TextLink href={`/party/${party.id}`} className="text-lead text-ink">
                  {party.title}
                </TextLink>
                <MetaLabel>{formatPartyTime(party)}</MetaLabel>
              </div>
              {party.subParties.length > 0 && (
                <ul aria-label={`「${party.title}」報名的子派對`} className="flex flex-col gap-1 pl-4">
                  {party.subParties.map((sub) => (
                    <li key={sub.id} className="flex flex-wrap items-baseline justify-between gap-x-6 text-body text-ink-secondary">
                      <span>子派對：{sub.title}</span>
                      <MetaLabel>{formatSubPartyRange(sub.startDateTime, sub.endDateTime)}</MetaLabel>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>
      )}
    </MemberTabPanel>
  );
}
