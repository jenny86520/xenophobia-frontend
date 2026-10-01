import type {
  PartyDetail,
  PartyListFilters,
  PartyListItem,
  UpcomingPartyResponse,
} from "@/types/party";
import type { AboutContent } from "@/types/about";

export type {
  PartySummary,
  UpcomingPartyResponse,
  PartyTimelineItem,
  PartyListItem,
  PartyDetail,
  PartyListFilters,
} from "@/types/party";
export type { AboutContent } from "@/types/about";

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

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
