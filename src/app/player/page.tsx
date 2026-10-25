import type { Metadata } from "next";
import { MetaLabel } from "@/components/brand/meta-label";
import { PageHeader } from "@/components/brand/page-header";
import { Section } from "@/components/brand/section";
import { TextLink } from "@/components/brand/text-link";
import { Heading } from "@/components/brand/typography";
import { PlayerNicknameForm } from "@/components/player/player-nickname-form";
import { SteamLoginLink } from "@/components/player/steam-login-link";
import { fetchGuestPlayer } from "@/lib/player-session";
import { playerLogoutAction } from "./actions";

export const metadata: Metadata = {
  title: "Player",
  description: "以 Steam 登入的訪客玩家頁。",
  robots: { index: false },
};

/**
 * A guest player's page (signed in with Steam, no member account): the nickname first, then the
 * Steam account and sign-out. Visitors who are not signed in get the Steam sign-in.
 */
export default async function PlayerPage() {
  const player = await fetchGuestPlayer();

  if (!player) {
    return (
      <main id="main">
        <Section spacing="tight" labelledBy="page-title">
          <PageHeader
            eyebrow="PLAYER / GUEST"
            title="訪客玩家"
            description="還不是會員也能參加內戰：以 Steam 帳號登入即可，不需要另外註冊。已是會員請登入會員後，在會員頁綁定 Steam。"
            actions={
              <>
                <SteamLoginLink intent="guest" label="以 Steam 登入" />
                <TextLink href="/member/login">會員登入</TextLink>
                <TextLink href="/matches">內戰場次</TextLink>
              </>
            }
          />
        </Section>
      </main>
    );
  }

  const firstTime = player.nickname === "";
  if (firstTime) {
    return (
      <main id="main">
        <Section spacing="tight" labelledBy="page-title">
          <PageHeader
            eyebrow="PLAYER / WELCOME"
            title="設定暱稱"
            description="已用 Steam 登入。先設定你在網站上顯示的暱稱。"
          />
          <div className="mt-section-tight">
            <PlayerNicknameForm nickname={player.steamName ?? ""} firstTime />
          </div>
        </Section>
      </main>
    );
  }

  const details = [
    { label: "暱稱", value: player.nickname },
    { label: "Steam 名稱", value: player.steamName ?? "—" },
    { label: "SteamID", value: player.steamId },
    { label: "評分", value: String(player.rating) },
  ];

  return (
    <main id="main">
      <Section spacing="tight" labelledBy="page-title">
        <PageHeader
          eyebrow="PLAYER / GUEST"
          title={player.nickname}
          actions={
            <form action={playerLogoutAction}>
              <button type="submit" className="link-underline text-body text-ink-secondary hover:text-ink">
                登出
              </button>
            </form>
          }
        />
        <dl className="mt-section-tight grid grid-cols-1 border-t border-line md:grid-cols-3">
          {details.map((item) => (
            <div key={item.label} className="flex flex-col gap-1 border-b border-line py-4 md:pr-6">
              <dt>
                <MetaLabel>{item.label}</MetaLabel>
              </dt>
              <dd className="text-lead break-all text-ink">{item.value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 flex flex-wrap gap-6 text-body text-ink-secondary">
          <TextLink href={player.profileUrl}>Steam 個人頁</TextLink>
          <TextLink href="/matches">內戰場次</TextLink>
        </p>
      </Section>

      <Section spacing="tight" labelledBy="player-nickname-title" ruled>
        <div className="flex flex-col gap-6">
          <Heading level={2} id="player-nickname-title">
            修改暱稱
          </Heading>
          <PlayerNicknameForm nickname={player.nickname} firstTime={false} />
          <p className="max-w-xl text-body text-ink-secondary">
            之後註冊成為會員，並在會員頁綁定同一個 Steam 帳號，訪客期間的紀錄會一併歸到會員帳號。
          </p>
        </div>
      </Section>
    </main>
  );
}
