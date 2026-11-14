import type { Metadata } from "next";
import { CtaLink } from "@/components/brand/cta-link";
import { MetaLabel } from "@/components/brand/meta-label";
import { PageHeader } from "@/components/brand/page-header";
import { Section } from "@/components/brand/section";
import { TextLink } from "@/components/brand/text-link";
import { Heading } from "@/components/brand/typography";
import { IceCreamIcon } from "@/components/brand/ice-cream-icon";
import { MemberTitleTag } from "@/components/cosmetics/member-title-tag";
import { FriendNoteForm } from "@/components/member/friend-forms";
import { IceCreamCard, IceCreamDetailCard, IceCreamGrid } from "@/components/ice-cream/ice-cream-card";
import { ICE_STATUS_TEXT } from "@/utils/ice-cream-events";
import { fetchIceCream, fetchMemberFriendProfile, fetchMemberProfile } from "@/lib/member-session";

export const metadata: Metadata = {
  title: "Friend",
  description: "XenoPhobiA 會員的好友資料。",
  robots: { index: false },
};

/**
 * One friend's page, for a signed-in member: nickname, member code, Discord ID, the linked Steam
 * account and scrim rating, and the member's own private note. The backend answers only for an
 * active friend; anything else reads as not found. There is no link back: the friends sidebar every
 * page has is the way back to the list.
 */
export default async function FriendPage({ params }: PageProps<"/member/friends/[memberId]">) {
  const { memberId } = await params;
  const me = await fetchMemberProfile();

  if (!me) {
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

  const friend = await fetchMemberFriendProfile(memberId);
  if (!friend) {
    return (
      <main id="main">
        <Section spacing="tight" labelledBy="page-title">
          <PageHeader
            eyebrow="FRIEND"
            title="找不到這位好友"
            description="你們可能已經不是好友，或對方的帳號目前無法使用。"
          />
        </Section>
      </main>
    );
  }

  // Each token's life for its dialog; one that cannot be read just shows its card without one.
  const histories = await Promise.all(friend.iceCreams.map((ice) => fetchIceCream(ice.id).catch(() => null)));

  const details = [
    { label: "會員編號", value: friend.memberCode ?? "—" },
    { label: "Discord ID", value: friend.discordId || "—" },
  ];

  return (
    <main id="main">
      <Section spacing="tight" labelledBy="page-title">
        <div>
          <PageHeader eyebrow={`FRIEND / ${friend.memberCode ?? "—"}`} title={friend.nickname} />
          {friend.memberTitle && <MemberTitleTag look={friend.memberTitle} className="mt-4 text-body" />}
        </div>
        <dl className="mt-section-tight grid max-w-3xl grid-cols-1 border-t border-line md:grid-cols-2">
          {details.map((item) => (
            <div key={item.label} className="flex flex-col gap-1 border-b border-line py-4 md:pr-6">
              <dt>
                <MetaLabel>{item.label}</MetaLabel>
              </dt>
              <dd className="text-lead break-all text-ink">{item.value}</dd>
            </div>
          ))}
          <div className="flex flex-col gap-1 border-b border-line py-4 md:pr-6">
            <dt>
              <MetaLabel>Steam</MetaLabel>
            </dt>
            <dd className="text-lead break-all text-ink">
              {friend.steam ? (
                <TextLink href={friend.steam.profileUrl}>{friend.steam.steamName ?? "已綁定"}</TextLink>
              ) : (
                <span className="text-ink-secondary">尚未綁定 Steam</span>
              )}
            </dd>
          </div>
          {friend.rating !== null && (
            <div className="flex flex-col gap-1 border-b border-line py-4 md:pr-6">
              <dt>
                <MetaLabel>內戰分數</MetaLabel>
              </dt>
              <dd className="font-mono text-lead text-ink tabular-nums">{friend.rating}</dd>
            </div>
          )}
        </dl>
      </Section>

      <Section spacing="tight" labelledBy="friend-ice-title">
        <Heading level={2} id="friend-ice-title">
          <span className="inline-flex items-center gap-3">
            <IceCreamIcon className="size-6" />
            冰炫風
          </span>
        </Heading>
        {friend.iceCreams.length === 0 ? (
          <p className="mt-6 text-body text-ink-secondary">目前沒有冰炫風。</p>
        ) : (
          <IceCreamGrid label={`${friend.nickname}的冰炫風`} className="mt-6">
            {friend.iceCreams.map((ice, index) => {
              const history = histories[index];
              return history ? (
                <IceCreamDetailCard key={ice.id} history={history} />
              ) : (
                <IceCreamCard
                  key={ice.id}
                  cover={{
                    serial: ice.serial,
                    issuer: ice.issuer,
                    state: `${friend.nickname}・${ICE_STATUS_TEXT[ice.status]}`,
                    cup: ice.cup ?? null,
                  }}
                />
              );
            })}
          </IceCreamGrid>
        )}
      </Section>

      <Section spacing="tight" labelledBy="note-title">
        <Heading level={2} id="note-title">
          我的備註
        </Heading>
        <div className="mt-6">
          <FriendNoteForm memberId={friend.memberId} note={friend.note} />
        </div>
      </Section>
    </main>
  );
}
