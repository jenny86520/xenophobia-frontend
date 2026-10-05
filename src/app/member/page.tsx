import type { Metadata } from "next";
import { CtaLink } from "@/components/brand/cta-link";
import { EditorialGrid } from "@/components/brand/editorial-grid";
import { Eyebrow } from "@/components/brand/eyebrow";
import { formatCount, MetaLabel } from "@/components/brand/meta-label";
import { PageHeader } from "@/components/brand/page-header";
import { Section } from "@/components/brand/section";
import { TextLink } from "@/components/brand/text-link";
import { Heading } from "@/components/brand/typography";
import { NicknameForm } from "@/components/member/member-forms";
import { fetchMemberProfile } from "@/lib/member-session";
import { logoutAction } from "./actions";

export const metadata: Metadata = {
  title: "Member",
  description: "XenoPhobiA 會員頁：個人資料與參加的活動。",
};

/** Members-only: the profile and joined parties; everyone else sees how to become a member. */
export default async function MemberPage() {
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
      </Section>

      <Section labelledBy="joined-title" ruled>
        <EditorialGrid className="gap-y-8">
          <div className="col-span-4 flex flex-col gap-4 md:col-span-8 lg:col-span-4">
            <Eyebrow>{`Joined / ${formatCount(profile.parties.length)}`}</Eyebrow>
            <Heading level={2} id="joined-title">
              參加的活動
            </Heading>
          </div>
          <div className="col-span-4 md:col-span-8 lg:col-span-8 lg:col-start-5">
            {profile.parties.length === 0 ? (
              <p className="text-body text-ink-secondary">
                還沒有報名任何活動。<TextLink href="/party">看看有哪些活動</TextLink>
              </p>
            ) : (
              <ol className="border-t border-line">
                {profile.parties.map((party) => (
                  <li key={party.id} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-line py-4">
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
          </div>
        </EditorialGrid>
      </Section>

      <Section labelledBy="nickname-title" ruled>
        <Heading level={2} id="nickname-title" className="mb-6">
          修改暱稱
        </Heading>
        <NicknameForm nickname={profile.nickname} />
      </Section>
    </main>
  );
}
