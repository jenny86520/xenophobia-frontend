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
};

export type RegistrationStatus = "open" | "not-open" | "closed";

/** Why a member cannot register (or leave) right now; null when the action is allowed. */
export type RegistrationBlock = "not-open" | "closed" | "no-permission" | "role-not-allowed" | null;

/** Public registration state of a party: the count, never names. */
export type RegistrationSummary = {
  status: RegistrationStatus;
  /** Taiwan time "YYYY-MM-DDTHH:mm", or null when registration closes at the start. */
  deadline: string | null;
  count: number;
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

/** Result of a member form's Server Action, rendered next to the form. */
export type MemberActionState = {
  ok?: boolean;
  message?: string;
  fields?: Record<string, string>;
  /** What was submitted, so a form React resets after the action can show it again. */
  values?: Record<string, string>;
};
