/** Scrim match types, as the backend's /api/matches routes return them. */

export type MatchStatus =
  | "lobby"
  | "roster_locked"
  | "team_draft"
  | "teams_confirmed"
  | "veto_active"
  | "veto_complete"
  | "server_starting"
  | "server_ready"
  | "in_game"
  | "completed"
  | "cancelled";

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
  maps: {
    key: string;
    name: string;
    imageUrl: string | null;
    bannedBy: "A" | "B" | null;
    step: number | null;
    /** Each team's wins on this map (the team's players added up), for the radar. */
    wins: { A: number; B: number };
  }[];
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

/** The match on its game server, for everyone (no address or password). */
export type MatchServer = {
  serverName: string | null;
  scoreA: number | null;
  scoreB: number | null;
  /** Set once completed; null then is a draw. */
  winner: "A" | "B" | null;
  /** server: MatchZy's result; manual: typed in by a manager (no full stats). */
  resultSource: "server" | "manual" | null;
  liveAt: string | null;
  completedAt: string | null;
};

/** How to join the server: only for the match's players and its managers. */
export type MatchConnect = { address: string; password: string; url: string };

/** One player's stats from the server; ADR and headshot % come worked out from the backend. */
export type MatchPlayerStats = {
  playerId: string;
  name: string;
  team: "A" | "B";
  kills: number;
  deaths: number;
  assists: number;
  damage: number;
  roundsPlayed: number;
  adr: number;
  headshotPercent: number;
  headshotKills: number;
  multiKills: { 2: number; 3: number; 4: number; 5: number };
  clutches: number;
  firstKills: number;
  firstDeaths: number;
  tradeKills: number;
  mvp: number;
  /** SWING per round from the demo, in percentage points (null until the demo is parsed). */
  swing: number | null;
};

/** The last start on a server, for managers. */
export type MatchServerSession = {
  status: "starting" | "loaded" | "live" | "finished" | "aborted" | "failed";
  serverId: string;
  serverName: string | null;
  startedBy: string;
  createdAt: string;
  deadlineAt: string;
  scriptRunAt: string | null;
  rconSentAt: string | null;
  configFetchedAt: string | null;
  liveAt: string | null;
  endedAt: string | null;
  error: string | null;
};

/** A scrim server the start form offers. */
export type ScrimServerOption = { id: string; name: string; inUse: boolean };

export type MatchSummary = {
  id: string;
  title: string;
  status: MatchStatus;
  game: { id: string; name: string };
  party: { id: string; title: string } | null;
  playerCount: number;
  capacity: number;
  createdAt: string;
  /** Who created it: 管理員 for matches made in the admin, else the member's nickname at the time. */
  createdBy: string;
};

export type MatchPlayer = {
  playerId: string;
  name: string;
  team: "A" | "B" | null;
  isCaptain: boolean;
  joinedAt: string;
  /** Only for signed-in viewers: the confirmed snapshot once the teams are confirmed. */
  rating?: number;
  /** Only for signed-in viewers, once the match is rated: this match's change. */
  ratingChange?: RatingChange;
};

/** One player's change in one rated match: the team result plus the personal part. */
export type RatingChange = {
  delta: number;
  teamPart: number;
  personalPart: number;
  /** "no-stats" when there was nothing to compare (a manual result, or no stats for the player). */
  note: string | null;
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
  /** What the manager named the team, else A 隊 / B 隊 (the backend applies the default). */
  name: string;
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
  /** From the start on a server on: its name and the live or final score. */
  server: MatchServer | null;
  /** While the teams are drafted: the candidates, for everyone to follow (only managers choose). */
  candidates: TeamCandidate[] | null;
  /** Whether the team names can change now (confirmed teams, before the start on a server). */
  teamNamesOpen: boolean;
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
    /** The team the viewer captains: they may rename it while `teamNamesOpen`. */
    captainOf: "A" | "B" | null;
    /** How to join, for this match's players and its creator while it waits or runs. */
    connect: MatchConnect | null;
    /** The demo is there and the viewer may download it (this match's players and its creator). */
    canDownloadDemo: boolean;
  };
  stats: MatchPlayerStats[];
};

export type CandidateSide = {
  playerIds: string[];
  total: number;
  average: number;
  /** `rating` is left out for visitors (they still get the totals). */
  players: { playerId: string; name: string; rating?: number }[];
  suggestedCaptain: string;
};

export type TeamCandidate = { teamA: CandidateSide; teamB: CandidateSide; difference: number };

export type ManagedMatch = MatchDetail & {
  createdBy: string;
  createdByMemberId: string | null;
  stats: MatchPlayerStats[];
  connect: MatchConnect | null;
  serverSession: MatchServerSession | null;
};

/** The member page's 內戰場次 tab: GET /api/member/matches. */
export type MemberMatches = {
  /** false until the member links Steam (no player, so no rating or matches). */
  steamLinked: boolean;
  rating: number | null;
  items: (MatchSummary & { team: "A" | "B" | null; isCaptain: boolean; ratingChange: RatingChange | null })[];
  /** Admins' adjustments of the member's rating, newest first. */
  adjustments: { before: number; after: number; delta: number; at: string }[];
};

/** A guest's own rating history: GET /api/player/me/ratings. */
export type RatingHistory = {
  rating: number;
  changes: {
    kind: "match" | "manual";
    before: number;
    after: number;
    delta: number;
    teamPart: number | null;
    personalPart: number | null;
    note: string | null;
    at: string;
    match: { id: string; title: string } | null;
  }[];
};

/** A finished match on the game page (results only): GET /api/games/cs2/matches. */
export type CompletedMatch = {
  id: string;
  title: string;
  party: { id: string; title: string } | null;
  mapName: string | null;
  teams: { A: string; B: string };
  scoreA: number | null;
  scoreB: number | null;
  winner: "A" | "B" | null;
  completedAt: string | null;
};

/** One line of the rating ladder (signed-in people only): GET /api/games/cs2/ladder. */
export type LadderEntry = {
  place: number;
  playerId: string;
  name: string;
  rating: number;
  matches: number;
  wins: number;
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
