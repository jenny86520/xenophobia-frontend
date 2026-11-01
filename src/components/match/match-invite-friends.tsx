import { MetaLabel } from "@/components/brand/meta-label";
import { TextLink } from "@/components/brand/text-link";
import { FriendName, friendHref } from "@/components/member/friend-name";
import type { MatchFriends } from "@/types/friends";
import { InviteFriendButton } from "./match-forms";

/** What each friend's row says, in words (never colour alone). */
function friendState(friend: MatchFriends["friends"][number]): string[] {
  if (friend.seated) return ["已在名單"];
  return [
    ...(friend.invited.group ? ["已邀請進小隊"] : []),
    ...(friend.invited.signup ? ["已邀請報名"] : []),
    ...(friend.hasSteam ? [] : ["尚未綁定 Steam"]),
  ];
}

/**
 * The match page's 邀請好友 block, for signed-in members while the match is open. Each friend gets
 * 邀進小隊 (only when the member is in a group of this match that has room) and 邀請報名; a friend
 * already on the roster gets no buttons.
 */
export function MatchInviteFriends({ matchId, friends }: { matchId: string; friends: MatchFriends }) {
  if (friends.friends.length === 0) {
    return (
      <p className="text-body text-ink-secondary">
        還沒有好友。<TextLink href="/member?tab=friends">到會員頁「好友」分頁加好友</TextLink>
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-4">
      <p className="text-body text-ink-secondary">
        {friends.canInviteToGroup
          ? "邀好友進你的小隊，對方接受後直接加入，不用輸入邀請碼；也可以只邀請他們來報名。"
          : "以小隊報名後，就能邀好友直接進你的小隊；現在可以邀請他們來報名。"}
      </p>
      <ul aria-label="好友" className="border-t border-line">
        {friends.friends.map((friend) => {
          const state = friendState(friend);
          return (
            <li
              key={friend.memberId}
              className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3 border-b border-line py-4"
            >
              <div className="flex min-w-0 flex-col gap-1">
                <FriendName nickname={friend.nickname} note={friend.note} href={friendHref(friend.memberId)} />
                {state.length > 0 && (
                  <span className="flex flex-wrap gap-x-4 gap-y-1">
                    {state.map((text) => (
                      <MetaLabel key={text}>{text}</MetaLabel>
                    ))}
                  </span>
                )}
              </div>
              {!friend.seated && (
                <div className="flex flex-wrap items-start gap-3">
                  {friends.canInviteToGroup && !friend.invited.group && (
                    <InviteFriendButton matchId={matchId} memberId={friend.memberId} kind="group" />
                  )}
                  {!friend.invited.signup && (
                    <InviteFriendButton matchId={matchId} memberId={friend.memberId} kind="signup" />
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
