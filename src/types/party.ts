import type { RegistrationSummary } from "./member";

/** Public path of a cover image (`/media/images/…`), or null when there is none. */
export type CoverUrl = string | null;

/**
 * Taiwan wall-clock start and end of a party: "" means not decided, and a date without a time
 * means the time is not decided. The end is optional ("").
 */
export type PartySchedule = {
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
};

export type PartySummary = PartySchedule & {
  id: string;
  title: string;
  summary: string;
  category: string;
  format: string;
  /** false = members only (the backend sends these only to signed-in members). */
  isPublic: boolean;
  coverUrl: CoverUrl;
};

export type NextParty = PartySchedule & {
  id: string;
  title: string;
  description: string;
  /** Shown on the home page; the description is laid out only on the detail page. */
  summary: string;
  category: string;
  format: string;
  location: string;
  isPublic: boolean;
  coverUrl: CoverUrl;
};

export type UpcomingPartyResponse = {
  nextParty: NextParty | null;
  recentParties: PartySummary[];
};

export type SubParty = {
  id: string;
  title: string;
  description: string;
  /** "YYYY-MM-DDTHH:mm:ss+08:00", "YYYY-MM-DD" (time not decided) or "" (not decided). */
  startDateTime: string;
  endDateTime: string;
  /** Empty string when no address was given. */
  location: string;
  coverUrl: CoverUrl;
  /** This sub-party's own count; status, deadline and pause are the party's. Detail only. */
  registration?: RegistrationSummary;
};

export type PartyListItem = PartySchedule & {
  id: string;
  title: string;
  description: string;
  category: string;
  format: string;
  status: string;
  location: string;
  summary: string;
  isPublic: boolean;
  coverUrl: CoverUrl;
};

export type PartyDetail = PartyListItem & {
  createdBy: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt?: string;
  subParties: SubParty[];
  /** Registration state and count (never the participants). */
  registration?: RegistrationSummary;
};

/** What a visitor gets for a members-only party: no content at all, only that it needs a sign-in. */
export type MembersOnlyParty = { membersOnly: true };

export type PartyListFilters = {
  status?: string;
  format?: string;
  category?: string;
};
