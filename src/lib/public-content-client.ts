const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

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

export type AboutContent = {
  teamProfile?: {
    name: string;
    introduction: string;
    mission: string;
  };
  milestones?: Array<{ id: string; title: string; description: string; date: string }>;
  contactInfo?: Array<{ id: string; label: string; type: string; value: string }>;
  highlights?: string[];
};

export async function fetchUpcomingParty(): Promise<UpcomingPartyResponse> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/parties/upcoming`);
  const payload = await response.json();
  return payload ?? {};
}

export async function fetchPartyList(filters: PartyListFilters): Promise<PartyListItem[]> {
  const params = new URLSearchParams();
  if (filters.status && filters.status !== "all") params.set("status", filters.status);
  if (filters.format && filters.format !== "all") params.set("format", filters.format);
  if (filters.category && filters.category !== "all") params.set("category", filters.category);

  const response = await fetch(`${BACKEND_BASE_URL}/api/parties?${params.toString()}`);
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

export async function fetchPartyDetail(id: string): Promise<PartyDetail | null> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/parties/${id}`);
  const data = await response.json();
  return data ?? null;
}

export async function fetchAboutContent(): Promise<AboutContent> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/about`);
  const payload = await response.json();
  return payload ?? {};
}
