/** Scrim match types, as the backend's /api/matches routes return them. */

export type MatchStatus =
  "lobby" | "roster_locked" | "team_draft" | "teams_confirmed" | "veto_active" | "veto_complete" | "cancelled";

export type VetoRule = "random" | "stronger_first" | "weaker_first";

/** Why a team bans first, as the backend's code (the site puts it into words). */
export type FirstBanReason = "random" | "a-higher" | "b-higher" | "a-lower" | "b-lower" | "tie-random";

/** The map veto, as every match view returns it once it has started. */
export type MatchVeto = {
  rule: VetoRule;
  firstTeam: "A" | "B";
  firstReason: FirstBanReason;
  stepSeconds: number;
  startedAt: string;
  /** imageUrl: the map's image when the veto started (backend path, see mediaUrl), or null. */
  maps: { key: string; name: string; imageUrl: string | null; bannedBy: "A" | "B" | null; step: number | null }[];
  bans: {
    step: number;
    team: "A" | "B";
    mapKey: string;
    mapName: string;
    byManager: boolean;
    random: boolean;
    actorLabel: string;
    at: string;
  }[];
  /** null once the map is decided. */
  turn: "A" | "B" | null;
  /** The number the next ban must carry; null once decided. */
  step: number | null;
  stepDeadline: string | null;
  overdue: boolean;
  finalMap: { key: string; name: string; imageUrl: string | null } | null;
};

export type MatchSummary = {
  id: string;
  title: string;
  status: MatchStatus;
  game: { id: string; name: string };
  party: { id: string; title: string } | null;
  playerCount: number;
  capacity: number;
  createdAt: string;
};

export type MatchPlayer = {
  playerId: string;
  name: string;
  team: "A" | "B" | null;
  isCaptain: boolean;
  joinedAt: string;
  /** Only for signed-in viewers: the confirmed snapshot once the teams are confirmed. */
  rating?: number;
};

export type MatchEntry = {
  id: string;
  /** false for a solo sign-up (no invite code). */
  isGroup: boolean;
  ownerPlayerId: string;
  players: MatchPlayer[];
  /** Only in the manager's view. */
  inviteCode?: string | null;
};

export type ConfirmedTeam = {
  playerIds: string[];
  captainId: string | null;
  total: number;
  average: number;
};

export type MatchDetail = MatchSummary & {
  entries: MatchEntry[];
  teams: { A: ConfirmedTeam; B: ConfirmedTeam; difference: number } | null;
  lockedAt: string | null;
  confirmedAt: string | null;
  cancelledAt: string | null;
  veto: MatchVeto | null;
};

export type ViewerMatch = MatchDetail & {
  viewer: {
    /** null for a member who has not linked Steam. */
    playerId: string | null;
    entryId: string | null;
    inviteCode: string | null;
    canManage: boolean;
    /** The viewer is the captain of the team whose turn it is to ban. */
    canBan: boolean;
  };
};

export type CandidateSide = {
  playerIds: string[];
  total: number;
  average: number;
  players: { playerId: string; name: string; rating: number }[];
  suggestedCaptain: string;
};

export type TeamCandidate = { teamA: CandidateSide; teamB: CandidateSide; difference: number };

export type ManagedMatch = MatchDetail & {
  createdBy: string;
  createdByMemberId: string | null;
  candidates: TeamCandidate[] | null;
};

/** The member page's 內戰場次 tab: GET /api/member/matches. */
export type MemberMatches = {
  /** false until the member links Steam (no player, so no rating or matches). */
  steamLinked: boolean;
  rating: number | null;
  items: (MatchSummary & { team: "A" | "B" | null; isCaptain: boolean })[];
};

export type MatchList = { items: MatchSummary[]; total: number; page: number; pageSize: number };

/** The result of a match form's Server Action (same shape as the member forms). */
export type MatchActionState = {
  ok?: boolean;
  message?: string;
  fields?: Record<string, string>;
  /** What was submitted, so a form React resets after the action can show it again. */
  values?: Record<string, string>;
};
