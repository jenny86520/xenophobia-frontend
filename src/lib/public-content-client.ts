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

/** Resolves to `null` when the party does not exist (404); throws on any other failed response. */
export async function fetchPartyDetail(id: string): Promise<PartyDetail | null> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/parties/${encodeURIComponent(id)}`);
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Failed to load party ${id}: HTTP ${response.status}`);
  }
  return response.json();
}

export async function fetchAboutContent(): Promise<AboutContent> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/about`);
  const payload = await response.json();
  return payload ?? {};
}
