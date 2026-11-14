import type { CosmeticLook } from "./cosmetic";
import type { LegalKey } from "./legal";
import type { SteamAccount } from "./player";

/** Shapes returned by the backend member API (declared locally, as with the other public types). */

export type MemberPartySummary = {
  id: string;
  title: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  status: string;
  registeredAt: string;
  /** The sub-parties of this party the member signed up for, in start order. */
  subParties: { id: string; title: string; startDateTime: string; endDateTime: string }[];
};

export type MemberProfile = {
  name: string;
  nickname: string;
  username: string;
  discordId: string;
  /** "XPA-0001". */
  memberCode: string | null;
  email: string;
  phone: string;
  role: { id: string; name: string } | null;
  parties: MemberPartySummary[];
  /** The linked Steam account, or null. */
  steam: SteamAccount | null;
  /** The role may create scrim matches and the permission is not paused (decided by the backend). */
  canCreateMatch: boolean;
  /** The title the member has equipped; null or missing when none. */
  memberTitle?: CosmeticLook | null;
  /** Whether the member must agree to renewed terms before any member action (decided by the backend). */
  legalConsent: LegalConsent;
};

export type LegalConsentDocument = {
  key: LegalKey;
  title: string;
  /** The current version, which agreeing records. */
  version: number;
  agreedVersion: number | null;
  required: boolean;
};

export type LegalConsent = {
  required: boolean;
  documents: LegalConsentDocument[];
};

/** A run of text within one line of a compared legal document. */
export type LegalDiffSegment = { text: string; change: "same" | "added" | "removed" };

/** One line as segments; a whole added or removed line is a single segment. */
export type LegalDiffLine = LegalDiffSegment[];

export type LegalDiffBlock =
  | { kind: "unchanged"; lines: string[] }
  | { kind: "omitted"; lineCount: number }
  | { kind: "changed"; removed: LegalDiffLine[]; added: LegalDiffLine[] };

/** What changed since the version the member agreed to (computed by the backend). */
export type LegalConsentChangesDocument = {
  key: LegalKey;
  title: string;
  version: number;
  agreedVersion: number | null;
  /** null when there is nothing to compare with; empty blocks when the text is the same. */
  comparison: { fromVersion: number; blocks: LegalDiffBlock[] } | null;
};

export type LegalConsentChanges = { documents: LegalConsentChangesDocument[] };

export type RegistrationStatus = "open" | "not-open" | "closed";

/** Why a member cannot register (or leave) right now; null when the action is allowed. */
export type RegistrationBlock =
  | "not-open"
  | "closed"
  | "paused"
  | "no-permission"
  | "role-not-allowed"
  /** A sub-party: register for the party first. */
  | "main-required"
  | null;

/** Public registration state of a party: the count, never names. */
export type RegistrationSummary = {
  status: RegistrationStatus;
  /** Taiwan time "YYYY-MM-DDTHH:mm", or null when registration closes at the start. */
  deadline: string | null;
  count: number;
  /** Registration is switched off site-wide by the admin; members who registered may still leave. */
  paused: boolean;
};

export type Participant = {
  nickname: string;
  /** Empty for a guest added without one. */
  discordId: string;
  registeredAt: string;
  /** A non-member an admin added by hand. */
  guest: boolean;
  /** The equipped title (spec member-cosmetics); null or missing when none. */
  memberTitle?: CosmeticLook | null;
};

/** A signed-in member's view of one sub-party: its own count, sign-up and list. */
export type SubPartyRegistrationView = {
  subPartyId: string;
  count: number;
  registered: boolean;
  blockedBy: RegistrationBlock;
  participants: Participant[];
};

/** What a signed-in member sees: the summary plus their own state and the participant list. */
export type MemberRegistrationView = RegistrationSummary & {
  registered: boolean;
  blockedBy: RegistrationBlock;
  participants: Participant[];
  /** Each sub-party; they follow the party's registration settings. */
  subParties: SubPartyRegistrationView[];
};

export type VideoSubmissionStatus = "pending" | "accepted" | "rejected";

/** One of the member's own highlight video submissions. */
export type MemberVideoSubmission = {
  id: string;
  /** null for 其他: then `otherGameName` is the game the member typed. */
  game: { id: string; name: string } | null;
  otherGameName: string;
  title: string;
  /** "YYYY-MM-DD". */
  recordedOn: string;
  source: "youtube" | "upload";
  youtubeId: string | null;
  status: VideoSubmissionStatus;
  /** Empty unless an admin gave a reason when rejecting. */
  rejectReason: string;
  createdAt: string;
  reviewedAt: string | null;
};

export type MemberVideoSubmissions = {
  items: MemberVideoSubmission[];
  /** Submissions are switched off site-wide by the admin. */
  paused: boolean;
  /** Whether the member may submit now: not paused and their role allows it (decided by the backend). */
  canSubmit: boolean;
  /** Uploads still allowed today (YouTube links are not counted). */
  uploadsLeftToday: number;
};

/** Result of a member form's Server Action, rendered next to the form. */
export type MemberActionState = {
  ok?: boolean;
  message?: string;
  fields?: Record<string, string>;
  /** What was submitted, so a form React resets after the action can show it again. */
  values?: Record<string, string>;
};

/** The streak campaign running today and the member's run in it. */
export type PointCampaignProgress = {
  id: string;
  title: string;
  /** Taiwan date, YYYY-MM-DD. */
  endDate: string;
  requiredDays: number;
  streak: number;
};

export type PointEntry = {
  id: string;
  /** Positive = credited, negative = spent. */
  amount: number;
  /** Ledger kind code (checkin, streak_bonus, …); the site names it. */
  kind: string;
  createdAt: string;
  /** What a cosmetic purchase bought (the item's current name); null otherwise. */
  detail?: string | null;
};

/** GET /api/member/points. */
export type MemberPoints = {
  balance: number;
  checkedInToday: boolean;
  campaign: PointCampaignProgress | null;
  entries: { items: PointEntry[]; total: number; page: number; pageSize: number };
  /** The stamp card look the member equipped; null or missing = the default seal. */
  stampLook?: CosmeticLook | null;
};

/** POST /api/member/check-ins. */
export type CheckInResult = {
  awarded: { checkin: number; streakBonus: number };
  balance: number;
  campaign: PointCampaignProgress | null;
};
