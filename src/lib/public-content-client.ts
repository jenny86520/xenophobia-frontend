import { connection } from "next/server";
import { cache } from "react";
import { forwardedForHeader } from "@/lib/forwarded-for";
import { memberToken } from "@/lib/member-session";
import type {
  MembersOnlyParty,
  PartyDetail,
  PartyListItem,
  UpcomingPartyResponse,
} from "@/types/party";
import type { AboutContent } from "@/types/about";
import type { LegalDocument, LegalKey } from "@/types/legal";
import type { Legends } from "@/types/legends";
import type { MatchDetail, MatchList } from "@/types/match";

export type {
  NextParty,
  PartySummary,
  UpcomingPartyResponse,
  SubParty,
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

type RequestOptions = {
  /**
   * Send the signed-in member's token, for content the backend shows only to members (members-only
   * parties and their titles on matches). Without a valid one the backend answers as to a visitor.
   */
  asMember?: boolean;
};

async function backendGet(path: string, { asMember = false }: RequestOptions = {}): Promise<Response> {
  // Backend content is edited in the admin, so never prerender it at build time: wait for
  // a request (connection) and fetch uncached, so edits show on the next visit.
  await connection();
  // Pass the visitor's address on, so the backend's rate limit counts visitors, not this server.
  const headers: Record<string, string> = { ...(await forwardedForHeader()) };
  const token = asMember ? await memberToken() : null;
  if (token) headers.Authorization = `Bearer ${token}`;
  return fetch(`${backendBaseUrl()}${path}`, { headers });
}

/** Fetches JSON from the backend: `null` on 404, throws on any other failed response. */
async function getJson<T>(path: string, options?: RequestOptions): Promise<T | null> {
  const response = await backendGet(path, options);
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Backend request failed: GET ${path} -> HTTP ${response.status}`);
  }
  return (await response.json()) as T;
}

async function getRequiredJson<T>(path: string, options?: RequestOptions): Promise<T> {
  const data = await getJson<T>(path, options);
  if (data === null) throw new Error(`Backend request failed: GET ${path} -> HTTP 404`);
  return data;
}

// React.cache de-duplicates identical calls within one server request
// (e.g. the layout and a page both reading /api/about).

export const fetchUpcomingParty = cache(
  (): Promise<UpcomingPartyResponse> =>
    getRequiredJson<UpcomingPartyResponse>("/api/parties/upcoming", { asMember: true }),
);

export const fetchPartyList = cache(
  async (status: string, format: string, category: string, order = "asc"): Promise<PartyListItem[]> => {
    const params = new URLSearchParams();
    if (status !== "all") params.set("status", status);
    if (format !== "all") params.set("format", format);
    if (category !== "all") params.set("category", category);
    // The backend sorts; asc (oldest first) is its default.
    if (order !== "asc") params.set("order", order);
    const query = params.toString();
    return getRequiredJson<PartyListItem[]>(`/api/parties${query ? `?${query}` : ""}`, { asMember: true });
  },
);

/** All parties regardless of status (used for the "parties held" figure). */
export const fetchAllParties = cache((): Promise<PartyListItem[]> => fetchPartyList("all", "all", "all"));

/**
 * Resolves to `null` when the party does not exist (404) and to `{ membersOnly: true }` when the
 * backend keeps a members-only party from this visitor (403 MEMBERS_ONLY); throws on any other
 * failed response.
 */
export const fetchPartyDetail = cache(async (id: string): Promise<PartyDetail | MembersOnlyParty | null> => {
  const path = `/api/parties/${encodeURIComponent(id)}`;
  const response = await backendGet(path, { asMember: true });
  if (response.status === 403) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    if (body?.error === "MEMBERS_ONLY") return { membersOnly: true };
  }
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Backend request failed: GET ${path} -> HTTP ${response.status}`);
  return (await response.json()) as PartyDetail;
});

export const fetchAboutContent = cache(
  (): Promise<AboutContent> => getRequiredJson<AboutContent>("/api/about"),
);

/** Scrim matches, open ones first; only a party's when partyId is given. */
export const fetchMatches = cache(
  (partyId?: string): Promise<MatchList> =>
    getRequiredJson<MatchList>(
      `/api/matches?pageSize=50${partyId ? `&partyId=${encodeURIComponent(partyId)}` : ""}`,
      { asMember: true },
    ),
);

/** The public view of a match (no ratings, no invite codes); `null` when it does not exist. */
export const fetchMatchDetail = cache(
  (id: string): Promise<MatchDetail | null> =>
    getJson<MatchDetail>(`/api/matches/${encodeURIComponent(id)}`, { asMember: true }),
);

/** The Legends boards and the overall ranking, computed by the backend on each request. */
export const fetchLegends = cache((): Promise<Legends> => getRequiredJson<Legends>("/api/legends"));

/** A legal document for the footer dialogs; `null` when the backend does not know it (404). */
export const fetchLegalDocument = cache(
  (key: LegalKey): Promise<LegalDocument | null> => getJson<LegalDocument>(`/api/legal/${key}`),
);
