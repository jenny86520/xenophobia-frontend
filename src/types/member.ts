import type { SteamAccount } from "./player";

/** Shapes returned by the backend member API (declared locally, as with the other public types). */

export type MemberPartySummary = {
  id: string;
  title: string;
  startDate: string;
  startTime: string;
  status: string;
  registeredAt: string;
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
};

export type RegistrationStatus = "open" | "not-open" | "closed";

/** Why a member cannot register (or leave) right now; null when the action is allowed. */
export type RegistrationBlock = "not-open" | "closed" | "paused" | "no-permission" | "role-not-allowed" | null;

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
};

/** What a signed-in member sees: the summary plus their own state and the participant list. */
export type MemberRegistrationView = RegistrationSummary & {
  registered: boolean;
  blockedBy: RegistrationBlock;
  participants: Participant[];
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
