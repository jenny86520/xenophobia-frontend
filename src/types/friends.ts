import type { MatchStatus } from "@/types/match";
import type { HeldIceCream } from "@/types/ice-cream";

/** Another member as friends see them: never account, contact or Steam details. */
export type FriendPerson = {
  memberId: string;
  nickname: string;
  memberCode: string | null;
  hasSteam: boolean;
};

/** A friend, with the viewer's own private note (null when none). */
export type Friend = FriendPerson & { since: string; note: string | null };

/** GET /api/member/friends/:memberId/profile: what a friend's page shows. */
export type FriendProfile = {
  memberId: string;
  nickname: string;
  memberCode: string | null;
  discordId: string;
  /** The linked Steam account; null when not linked. */
  steam: { steamName: string | null; profileUrl: string } | null;
  /** Scrim rating; only with a linked Steam account. */
  rating: number | null;
  /** The viewer's own private note. */
  note: string | null;
  /** The ice cream tokens the friend holds now. */
  iceCreams: HeldIceCream[];
};

export type FriendRequest = { id: string; member: FriendPerson; createdAt: string };

export type MatchInviteKind = "group" | "signup";

/** A valid scrim invite (the backend leaves out invites that no longer apply). */
export type MatchInvite = {
  id: string;
  kind: MatchInviteKind;
  /** The inviting friend, with the viewer's own private note. */
  from: { nickname: string; memberCode: string | null; note: string | null };
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
  friends: Array<FriendPerson & { seated: boolean; invited: Record<MatchInviteKind, boolean>; note: string | null }>;
};
