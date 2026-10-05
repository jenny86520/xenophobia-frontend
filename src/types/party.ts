import type { RegistrationSummary } from "./member";

/** Public path of a cover image (`/media/images/…`), or null when there is none. */
export type CoverUrl = string | null;

export type PartySummary = {
  id: string;
  title: string;
  summary: string;
  category: string;
  format: string;
  startDate: string;
  startTime: string;
  coverUrl: CoverUrl;
};

export type NextParty = {
  id: string;
  title: string;
  description: string;
  category: string;
  format: string;
  startDate: string;
  startTime: string;
  location: string;
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
  startDateTime: string;
  /** Empty string when no address was given. */
  location: string;
  coverUrl: CoverUrl;
};

export type PartyListItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  format: string;
  status: string;
  startDate: string;
  startTime: string;
  location: string;
  summary: string;
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

export type PartyListFilters = {
  status?: string;
  format?: string;
  category?: string;
};
