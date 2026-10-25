import type { Metadata } from "next";
import { PageHeader } from "@/components/brand/page-header";
import { Section } from "@/components/brand/section";
import { TextLink } from "@/components/brand/text-link";
import { CreateMatchForm } from "@/components/match/match-forms";
import { fetchMemberProfile } from "@/lib/member-session";
import { fetchPartyList } from "@/lib/public-content-client";

export const metadata: Metadata = {
  title: "建立場次",
  robots: { index: false },
};

/** A member whose role has match.create (and the permission is not paused) creates a match here. */
export default async function NewMatchPage() {
  const member = await fetchMemberProfile();

  if (!member?.canCreateMatch) {
    return (
      <main id="main">
        <Section spacing="tight" labelledBy="page-title">
          <PageHeader
            eyebrow="MATCHES / NEW"
            title="建立場次"
            description={
              member
                ? "目前無法建立內戰場次：你的角色沒有這個權限、建立場次暫停中，或網站還沒有 Counter-Strike 2 遊戲項目。需要的話請聯絡管理員。"
                : "建立場次需要先登入會員。"
            }
            actions={
              member ? (
                <TextLink href="/matches">回到內戰場次</TextLink>
              ) : (
                <TextLink href="/member/login">會員登入</TextLink>
              )
            }
          />
        </Section>
      </main>
    );
  }

  const parties = await fetchPartyList("active", "all", "games");
  const partyOptions = parties.map((party) => ({ value: party.id, label: `${party.startDate} ${party.title}` }));

  return (
    <main id="main">
      <Section spacing="tight" labelledBy="page-title">
        <PageHeader
          eyebrow="MATCHES / NEW"
          title="建立場次"
          description="建立後你可以在場次頁管理名單、鎖定、分隊與取消。"
        />
        <div className="mt-section-tight">
          <CreateMatchForm parties={partyOptions} />
        </div>
      </Section>
    </main>
  );
}
