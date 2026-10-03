import { connection } from "next/server";
import { cache } from "react";
import type {
  PartyDetail,
  PartyListItem,
  UpcomingPartyResponse,
} from "@/types/party";
import type { AboutContent } from "@/types/about";

export type {
  NextParty,
  PartySummary,
  UpcomingPartyResponse,
  PartyTimelineItem,
  PartyListItem,
  PartyDetail,
  PartyListFilters,
} from "@/types/party";
export type { AboutContent, ContactInfo, Game, Milestone, TeamProfile } from "@/types/about";

/**
 * Server Components fetch the backend directly. BACKEND_URL wins (it can be an
 * internal address); otherwise fall back to the public URL. Read per call so
 * tests and runtime config changes take effect.
 */
export function backendBaseUrl(): string {
  return process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";
}

/** Fetches JSON from the backend: `null` on 404, throws on any other failed response. */
async function getJson<T>(path: string): Promise<T | null> {
  // Backend content is edited in the admin, so never prerender it at build time: wait for
  // a request (connection) and fetch uncached, so edits show on the next visit.
  await connection();
  const response = await fetch(`${backendBaseUrl()}${path}`);
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Backend request failed: GET ${path} -> HTTP ${response.status}`);
  }
  return (await response.json()) as T;
}

async function getRequiredJson<T>(path: string): Promise<T> {
  const data = await getJson<T>(path);
  if (data === null) throw new Error(`Backend request failed: GET ${path} -> HTTP 404`);
  return data;
}

// React.cache de-duplicates identical calls within one server request
// (e.g. the layout and a page both reading /api/about).

export const fetchUpcomingParty = cache(
  (): Promise<UpcomingPartyResponse> => getRequiredJson<UpcomingPartyResponse>("/api/parties/upcoming"),
);

export const fetchPartyList = cache(
  async (status: string, format: string, category: string): Promise<PartyListItem[]> => {
    const params = new URLSearchParams();
    if (status !== "all") params.set("status", status);
    if (format !== "all") params.set("format", format);
    if (category !== "all") params.set("category", category);
    const query = params.toString();
    return getRequiredJson<PartyListItem[]>(`/api/parties${query ? `?${query}` : ""}`);
  },
);

/** All parties regardless of status (used for the "parties held" figure). */
export const fetchAllParties = cache((): Promise<PartyListItem[]> => fetchPartyList("all", "all", "all"));

/** Resolves to `null` when the party does not exist (404); throws on any other failed response. */
export const fetchPartyDetail = cache(
  (id: string): Promise<PartyDetail | null> =>
    getJson<PartyDetail>(`/api/parties/${encodeURIComponent(id)}`),
);

export const fetchAboutContent = cache(
  (): Promise<AboutContent> => getRequiredJson<AboutContent>("/api/about"),
);
