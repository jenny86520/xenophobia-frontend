import type { MatchStatus } from "@/types/match";

/** Another member as friends see them: never account, contact or Steam details. */
export type FriendPerson = {
  memberId: string;
  nickname: string;
  memberCode: string | null;
  hasSteam: boolean;
};

export type Friend = FriendPerson & { since: string };

export type FriendRequest = { id: string; member: FriendPerson; createdAt: string };

export type MatchInviteKind = "group" | "signup";

/** A valid scrim invite (the backend leaves out invites that no longer apply). */
export type MatchInvite = {
  id: string;
  kind: MatchInviteKind;
  from: { nickname: string; memberCode: string | null };
  match: { id: string; title: string; status: MatchStatus; playerCount: number; rosterSize: number };
  createdAt: string;
};

/** GET /api/member/friends: the member page's 好友 tab. */
export type FriendsOverview = {
  memberCode: string | null;
  friends: Friend[];
  incoming: FriendRequest[];
  outgoing: FriendRequest[];
  matchInvites: MatchInvite[];
};

/** GET /api/matches/:id/friends: the match page's 邀請好友 block. */
export type MatchFriends = {
  canInviteToGroup: boolean;
  friends: Array<FriendPerson & { seated: boolean; invited: Record<MatchInviteKind, boolean> }>;
};
