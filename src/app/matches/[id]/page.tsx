import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EditorialGrid } from "@/components/brand/editorial-grid";
import { Eyebrow } from "@/components/brand/eyebrow";
import { MetaLabel } from "@/components/brand/meta-label";
import { Section } from "@/components/brand/section";
import { TextLink } from "@/components/brand/text-link";
import { Heading } from "@/components/brand/typography";
import { JoinGroupForm, LeaveButton, SignUpButtons } from "@/components/match/match-forms";
import { MatchInviteFriends } from "@/components/match/match-invite-friends";
import { MatchManage } from "@/components/match/match-manage";
import { MatchRoom } from "@/components/match/match-room";
import { MatchStatusLabel } from "@/components/match/match-status";
import { SteamLoginLink } from "@/components/player/steam-login-link";
import { fetchManagedMatch, fetchMatchFriends, fetchMatchServers, fetchViewerMatch } from "@/lib/player-actor";
import { fetchMatchDetail } from "@/lib/public-content-client";
import type { ViewerMatch } from "@/types/match";

export async function generateMetadata({ params }: PageProps<"/matches/[id]">): Promise<Metadata> {
  const { id } = await params;
  const match = await fetchMatchDetail(id).catch(() => null);
  return match ? { title: match.title, description: `${match.game.name} 內戰場次` } : { title: "找不到場次" };
}

/** What the signed-in viewer may do now; the backend still decides when they try. */
function SignUp({ match }: { match: ViewerMatch }) {
  const { viewer } = match;
  if (!viewer.playerId) {
    return (
      <p className="text-body text-ink-secondary">
        報名內戰需要先綁定 Steam 帳號。<TextLink href="/member">到會員頁綁定 Steam</TextLink>
      </p>
    );
  }
  if (viewer.entryId) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-body text-ink">你已報名這場。</p>
        {viewer.inviteCode && (
          <p className="text-body text-ink-secondary">
            你的小隊邀請碼：
            <span className="ml-2 font-mono text-lead tracking-widest text-ink">{viewer.inviteCode}</span>
            <span className="block text-caption text-ink-muted">把邀請碼給隊友，小隊最多 5 人。</span>
          </p>
        )}
        {match.status === "lobby" && <LeaveButton matchId={match.id} />}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-6">
      <SignUpButtons matchId={match.id} />
      <JoinGroupForm matchId={match.id} />
    </div>
  );
}

/**
 * A match: sign-up while it is open, then the match room (the roster, or the two teams around what
 * happens now) and, for the member who created it, the management area. Signed-in viewers see
 * ratings and their own sign-up.
 */
export default async function MatchPage({ params, searchParams }: PageProps<"/matches/[id]">) {
  const { id } = await params;
  const { candidate } = await searchParams;
  const viewerMatch = await fetchViewerMatch(id);
  const match = viewerMatch ?? (await fetchMatchDetail(id));
  if (!match) notFound();
  const managed = viewerMatch?.viewer.canManage ? await fetchManagedMatch(id) : null;
  // Only signed-in members have friends, and invites only make sense while sign-up is open.
  const friends = viewerMatch && match.status === "lobby" ? await fetchMatchFriends(id) : null;
  const shown = managed ?? match;
  // The start form lists the scrim servers only while there is something to start.
  const servers = managed && match.status === "veto_complete" ? await fetchMatchServers(id) : null;

  return (
    <main id="main">
      <Section spacing="tight" labelledBy="page-title">
        <TextLink href="/matches" className="text-body text-ink-secondary hover:text-ink">
          <span aria-hidden="true">←</span> 內戰場次
        </TextLink>
        <header className="mt-10 flex flex-col gap-6">
          <Eyebrow>{`MATCH / ${match.game.name}`}</Eyebrow>
          <Heading level={1} id="page-title">
            {match.title}
          </Heading>
          <p className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <MatchStatusLabel status={match.status} />
            <span className="font-mono text-label text-ink tabular-nums">
              {match.playerCount} / {match.capacity}
            </span>
            {match.party && (
              <span className="text-body text-ink-secondary">
                派對：<TextLink href={`/party/${match.party.id}`}>{match.party.title}</TextLink>
              </span>
            )}
          </p>
        </header>
      </Section>

      {match.status === "lobby" && (
        <Section spacing="tight" labelledBy="signup-title" ruled>
          <EditorialGrid className="gap-y-6">
            <div className="col-span-4 md:col-span-8 lg:col-span-4">
              <Heading level={2} id="signup-title">
                報名
              </Heading>
            </div>
            <div className="col-span-4 md:col-span-8 lg:col-span-8 lg:col-start-5">
              {viewerMatch ? (
                <SignUp match={viewerMatch} />
              ) : (
                <div className="flex flex-col gap-4">
                  <p className="text-body text-ink-secondary">
                    以 Steam 登入就能報名；會員請先登入，並在會員頁綁定 Steam。
                  </p>
                  <div className="flex flex-wrap items-center gap-6">
                    <SteamLoginLink intent="guest" label="以 Steam 登入" />
                    <TextLink href="/member/login">會員登入</TextLink>
                  </div>
                </div>
              )}
            </div>
          </EditorialGrid>
        </Section>
      )}

      {friends && (
        <Section spacing="tight" labelledBy="invite-friends-title" ruled>
          <EditorialGrid className="gap-y-6">
            <div className="col-span-4 md:col-span-8 lg:col-span-4">
              <Heading level={2} id="invite-friends-title">
                邀請好友
              </Heading>
            </div>
            <div className="col-span-4 md:col-span-8 lg:col-span-8 lg:col-start-5">
              <MatchInviteFriends matchId={match.id} friends={friends} />
            </div>
          </EditorialGrid>
        </Section>
      )}

      <Section spacing="tight" labelledBy="room-title" ruled>
        <div className="mb-8 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <Heading level={2} id="room-title">
            比賽室
          </Heading>
          {!viewerMatch && <MetaLabel>登入後可看到每位玩家的評分</MetaLabel>}
        </div>
        <MatchRoom
          match={shown}
          managed={managed}
          canBan={viewerMatch?.viewer.canBan ?? false}
          connect={viewerMatch?.viewer.connect ?? managed?.connect ?? null}
          stats={viewerMatch?.stats ?? managed?.stats ?? null}
          captainOf={viewerMatch?.viewer.captainOf ?? null}
          signedIn={viewerMatch !== null || managed !== null}
          candidate={candidate}
          servers={servers}
        />
      </Section>

      {managed && (
        <Section spacing="tight" labelledBy="manage-title" ruled>
          <EditorialGrid className="gap-y-6">
            <div className="col-span-4 md:col-span-8 lg:col-span-4">
              <Heading level={2} id="manage-title">
                管理
              </Heading>
            </div>
            <div className="col-span-4 md:col-span-8 lg:col-span-8 lg:col-start-5">
              <MatchManage match={managed} />
            </div>
          </EditorialGrid>
        </Section>
      )}
    </main>
  );
}
