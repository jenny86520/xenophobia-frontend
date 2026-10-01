export type PartySummary = {
  id: string;
  title: string;
  summary: string;
  category: string;
  format: string;
  startDate: string;
  startTime: string;
};

export type UpcomingPartyResponse = {
  nextParty?: {
    id: string;
    title: string;
    description: string;
    category: string;
    format: string;
    startDate: string;
    startTime: string;
    location: string;
  };
  recentParties?: PartySummary[];
};

export type PartyTimelineItem = {
  id: string;
  title: string;
  description: string;
  startDateTime: string;
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
};

export type PartyDetail = PartyListItem & {
  createdBy: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt?: string;
  timeline?: PartyTimelineItem[];
};

export type PartyListFilters = {
  status?: string;
  format?: string;
  category?: string;
};
