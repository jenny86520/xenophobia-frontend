import type { ReactNode } from "react";
import { acceptMatchInviteAction, answerFriendRequestAction, dismissMatchInviteAction } from "@/app/member/actions";
import { EditorialGrid } from "@/components/brand/editorial-grid";
import { Eyebrow } from "@/components/brand/eyebrow";
import { formatCount, MetaLabel } from "@/components/brand/meta-label";
import { TextLink } from "@/components/brand/text-link";
import { Heading } from "@/components/brand/typography";
import { MATCH_STATUS_TEXT } from "@/components/match/match-status";
import type { FriendPerson, FriendsOverview, MatchInvite } from "@/types/friends";
import { AddFriendForm, FriendActionButton, RemoveFriendForm } from "./friend-forms";

/**
 * The member page's 好友 tab in two columns from 1024px: the friends in the main column, and on the
 * right the member's own number with the add form, then scrim invites, requests received and
 * requests sent. Below 1024px the two stack, friends first. Every action is a form, so all of it
 * works without JavaScript. Others are only shown by nickname, member code and whether Steam is linked.
 */
export function MemberFriendsPanel({ overview }: { overview: FriendsOverview }) {
  return (
    <section aria-labelledby="friends-title">
      <div className="mb-10 flex flex-col gap-4">
        <Eyebrow>{`Friends / ${formatCount(overview.friends.length)}`}</Eyebrow>
        <Heading level={2} id="friends-title">
          好友
        </Heading>
      </div>
      <EditorialGrid className="gap-y-12">
        <div className="col-span-4 md:col-span-8 lg:col-span-7">
          <FriendsSection
            id="friend-list-title"
            title="好友清單"
            hideTitle
            empty="目前沒有好友，在右側輸入朋友的會員編號就能送出邀請。"
          >
            {overview.friends.map((friend) => (
              <PersonRow key={friend.memberId} person={friend}>
                {/* A disclosure keeps the confirm form out of the way; it opens without JavaScript. */}
                <details className="group">
                  <summary className="cursor-pointer text-body text-ink-secondary hover:text-ink focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none">
                    刪除好友
                  </summary>
                  <div className="mt-3">
                    <RemoveFriendForm memberId={friend.memberId} nickname={friend.nickname} />
                  </div>
                </details>
              </PersonRow>
            ))}
          </FriendsSection>
        </div>

        <div className="col-span-4 flex flex-col gap-10 md:col-span-8 lg:col-span-5 lg:col-start-8 lg:border-l lg:border-line lg:pl-8">
          <div className="flex flex-col gap-6 border-b border-line pb-8">
            <dl className="flex flex-col gap-1">
              <dt>
                <MetaLabel>我的會員編號</MetaLabel>
              </dt>
              <dd className="font-mono text-h2 text-ink tabular-nums">{overview.memberCode ?? "—"}</dd>
            </dl>
            <p className="text-body text-ink-secondary">把會員編號告訴朋友，或輸入朋友的會員編號送出好友邀請。</p>
            <AddFriendForm />
          </div>

          <FriendsSection id="match-invites-title" title="內戰場次邀請" empty="目前沒有內戰場次邀請。">
            {overview.matchInvites.map((invite) => (
              <MatchInviteRow key={invite.id} invite={invite} />
            ))}
          </FriendsSection>

          <FriendsSection id="incoming-title" title="收到的好友邀請" empty="沒有收到好友邀請。">
            {overview.incoming.map((request) => (
              <PersonRow key={request.id} person={request.member}>
                <FriendActionButton
                  action={answerFriendRequestAction.bind(null, request.id, "accept")}
                  label="接受"
                  primary
                />
                <FriendActionButton action={answerFriendRequestAction.bind(null, request.id, "decline")} label="拒絕" />
              </PersonRow>
            ))}
          </FriendsSection>

          <FriendsSection id="outgoing-title" title="送出的好友邀請" empty="沒有等待回覆的邀請。">
            {overview.outgoing.map((request) => (
              <PersonRow key={request.id} person={request.member} note="等待對方回覆">
                <FriendActionButton
                  action={answerFriendRequestAction.bind(null, request.id, "withdraw")}
                  label="收回"
                />
              </PersonRow>
            ))}
          </FriendsSection>
        </div>
      </EditorialGrid>
    </section>
  );
}

/** A titled list; an empty one says so in words (nobody there is a real state, not missing content). */
function FriendsSection({
  id,
  title,
  empty,
  hideTitle,
  children,
}: {
  id: string;
  title: string;
  empty: string;
  /** Keeps the title for assistive tech only (the friend list sits right under the tab's own heading). */
  hideTitle?: boolean;
  children: ReactNode[];
}) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-4">
      <h3 id={id} className={hideTitle ? "sr-only" : "font-heading text-h3 text-ink"}>
        {title}
        {!hideTitle && children.length > 0 && (
          <span className="ml-3 font-mono text-label text-ink-secondary tabular-nums">{children.length}</span>
        )}
      </h3>
      {children.length === 0 ? (
        <p className="text-body text-ink-secondary">{empty}</p>
      ) : (
        <ul aria-labelledby={id} className="border-t border-line">
          {children}
        </ul>
      )}
    </section>
  );
}

function PersonRow({ person, note, children }: { person: FriendPerson; note?: string; children: ReactNode }) {
  return (
    <li className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3 border-b border-line py-4">
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-lead break-all text-ink">{person.nickname}</span>
        <span className="flex flex-wrap gap-x-4 gap-y-1">
          <MetaLabel>{person.memberCode ?? "—"}</MetaLabel>
          {!person.hasSteam && <MetaLabel>尚未綁定 Steam</MetaLabel>}
          {note && <MetaLabel>{note}</MetaLabel>}
        </span>
      </div>
      <div className="flex flex-wrap items-start gap-3">{children}</div>
    </li>
  );
}

function MatchInviteRow({ invite }: { invite: MatchInvite }) {
  const { match } = invite;
  return (
    <li className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3 border-b border-line py-4">
      <div className="flex min-w-0 flex-col gap-1">
        <TextLink href={`/matches/${match.id}`} className="text-lead text-ink">
          {match.title}
        </TextLink>
        <p className="text-body text-ink-secondary">
          「{invite.from.nickname}」{invite.kind === "group" ? "邀你加入小隊" : "邀你報名這一場"}
        </p>
        <MetaLabel>
          {MATCH_STATUS_TEXT[match.status]}・{match.playerCount} / {match.rosterSize} 人
        </MetaLabel>
      </div>
      <div className="flex flex-wrap items-start gap-3">
        {invite.kind === "group" ? (
          <FriendActionButton action={acceptMatchInviteAction.bind(null, invite.id)} label="加入小隊" primary />
        ) : (
          <TextLink href={`/matches/${match.id}`} className="py-2 text-body text-ink">
            前往報名
          </TextLink>
        )}
        <FriendActionButton action={dismissMatchInviteAction.bind(null, invite.id)} label="略過" />
      </div>
    </li>
  );
}
