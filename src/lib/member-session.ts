import { cookies } from "next/headers";
import { cache } from "react";
import { forwardedForHeader } from "@/lib/forwarded-for";
import { backendBaseUrl } from "@/lib/public-content-client";
import type { ClipList } from "@/types/clip";
import type { CosmeticCollection } from "@/types/cosmetic";
import type { FriendProfile, FriendsOverview } from "@/types/friends";
import type { IceAlbumPage, IceCreamHistory, MemberIceCreams } from "@/types/ice-cream";
import type { MemberMatches } from "@/types/match";
import type { NewsSummary } from "@/types/news";
import type { Quest } from "@/types/quest";
import type {
  LegalConsentChanges,
  MemberPoints,
  MemberProfile,
  MemberRegistrationView,
  MemberVideoSubmissions,
} from "@/types/member";

/**
 * The member's access token lives only in this httpOnly cookie: browser JavaScript cannot read it,
 * and every backend call that needs it is made from the server (pages and Server Actions).
 */
export const MEMBER_COOKIE = "xpa_member";

export function memberCookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

export async function memberToken(): Promise<string | null> {
  return (await cookies()).get(MEMBER_COOKIE)?.value ?? null;
}

/** Only callable from a Server Action (cookies cannot be written while rendering). */
export async function setMemberToken(token: string, maxAgeSeconds: number): Promise<void> {
  (await cookies()).set(MEMBER_COOKIE, token, memberCookieOptions(maxAgeSeconds));
}

/** Only callable from a Server Action. */
export async function clearMemberToken(): Promise<void> {
  (await cookies()).delete(MEMBER_COOKIE);
}

/** Calls the backend, adding the member's token when there is one and the visitor's X-Forwarded-For. Never cached. */
export async function memberFetch(path: string, init: RequestInit = {}, token?: string | null): Promise<Response> {
  const bearer = token === undefined ? await memberToken() : token;
  const headers = new Headers(init.headers);
  if (bearer) headers.set("Authorization", `Bearer ${bearer}`);
  for (const [name, value] of Object.entries(await forwardedForHeader())) headers.set(name, value);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  return fetch(`${backendBaseUrl()}${path}`, { ...init, headers, cache: "no-store" });
}

/**
 * The signed-in member's profile, or null when there is no session or the backend refuses it
 * (expired, disabled, locked). A stale cookie is only cleared by the next Server Action, since
 * pages cannot write cookies.
 */
export async function fetchMemberProfile(): Promise<MemberProfile | null> {
  const token = await memberToken();
  if (!token) return null;
  const response = await memberFetch("/api/member/me", {}, token);
  if (response.status === 401) return null;
  if (!response.ok) throw new Error(`Backend request failed: GET /api/member/me -> HTTP ${response.status}`);
  return (await response.json()) as MemberProfile;
}

/** The member's own video submissions and today's remaining uploads, or null when not signed in. */
export async function fetchMemberVideoSubmissions(): Promise<MemberVideoSubmissions | null> {
  const token = await memberToken();
  if (!token) return null;
  const path = "/api/member/video-submissions";
  const response = await memberFetch(path, {}, token);
  if (response.status === 401) return null;
  if (!response.ok) throw new Error(`Backend request failed: GET ${path} -> HTTP ${response.status}`);
  return (await response.json()) as MemberVideoSubmissions;
}

/** The member's balance, today's check-in, the running streak campaign and one page of entries; null when not signed in. */
export async function fetchMemberPoints(page = 1): Promise<MemberPoints | null> {
  const token = await memberToken();
  if (!token) return null;
  const path = `/api/member/points?page=${page}`;
  const response = await memberFetch(path, {}, token);
  if (response.status === 401) return null;
  if (!response.ok) throw new Error(`Backend request failed: GET ${path} -> HTTP ${response.status}`);
  return (await response.json()) as MemberPoints;
}

/** Calls a members-only GET; null when signed out or the token is refused (and on 404). */
async function memberGetJson<T>(path: string): Promise<T | null> {
  const token = await memberToken();
  if (!token) return null;
  const response = await memberFetch(path, {}, token);
  if (response.status === 401 || response.status === 404) return null;
  if (!response.ok) throw new Error(`Backend request failed: GET ${path} -> HTTP ${response.status}`);
  return (await response.json()) as T;
}

/** The member's newbie quests; null when signed out or the backend cannot answer (the list is then left out). */
export async function fetchMemberQuests(): Promise<Quest[] | null> {
  try {
    return (await memberGetJson<{ quests: Quest[] }>("/api/member/quests"))?.quests ?? null;
  } catch {
    return null;
  }
}

/** The member's tokens, gifts waiting for them and redemptions asked of them; null when signed out. */
export function fetchMemberIceCreams(): Promise<MemberIceCreams | null> {
  return memberGetJson<MemberIceCreams>("/api/member/ice-creams");
}

/** The member's cosmetics (collection, what is equipped, cup stock); null when signed out. */
export function fetchMemberCosmetics(): Promise<CosmeticCollection | null> {
  return memberGetJson<CosmeticCollection>("/api/member/cosmetics");
}

/** Clips per page: four full rows of three (each one an embedded player, loaded lazily). */
export const CLIPS_PAGE_SIZE = 12;

/** One page of /clips (members only); null when signed out or refused (the page then asks to sign in). */
export function fetchClips(query: { gameId: string | null; sort: string; page: number }): Promise<ClipList | null> {
  const params = new URLSearchParams({ sort: query.sort, page: String(query.page), pageSize: String(CLIPS_PAGE_SIZE) });
  if (query.gameId) params.set("gameId", query.gameId);
  return memberGetJson<ClipList>(`/api/clips?${params.toString()}`);
}

/** Tokens per album page: three or four full rows of cards. */
const ICE_ALBUM_PAGE_SIZE = 12;

/** One page of the growth record's album (members only); null when signed out. */
export function fetchIceCreamAlbum(page = 1): Promise<IceAlbumPage | null> {
  return memberGetJson<IceAlbumPage>(`/api/ice-creams?page=${page}&pageSize=${ICE_ALBUM_PAGE_SIZE}`);
}

/** One token's whole life (members only); null when signed out or unknown. */
export function fetchIceCream(id: string): Promise<IceCreamHistory | null> {
  return memberGetJson<IceCreamHistory>(`/api/ice-creams/${encodeURIComponent(id)}`);
}

/** The member's own scrims and rating, or null when not signed in. */
export async function fetchMemberMatches(): Promise<MemberMatches | null> {
  const token = await memberToken();
  if (!token) return null;
  const path = "/api/member/matches";
  const response = await memberFetch(path, {}, token);
  if (response.status === 401) return null;
  if (!response.ok) throw new Error(`Backend request failed: GET ${path} -> HTTP ${response.status}`);
  return (await response.json()) as MemberMatches;
}

/**
 * What changed in the terms the member must agree to again. Never throws: null when signed out or on any
 * failure, so the consent panel still lets the member read the full text and agree.
 */
export async function fetchMemberLegalChanges(): Promise<LegalConsentChanges | null> {
  const token = await memberToken();
  if (!token) return null;
  try {
    const response = await memberFetch("/api/member/legal-consent", {}, token);
    return response.ok ? ((await response.json()) as LegalConsentChanges) : null;
  } catch {
    return null;
  }
}

/** The member's view of a party's registration, or null when not signed in. */
export async function fetchMemberRegistration(partyId: string): Promise<MemberRegistrationView | null> {
  const token = await memberToken();
  if (!token) return null;
  const path = `/api/member/parties/${encodeURIComponent(partyId)}/registration`;
  const response = await memberFetch(path, {}, token);
  if (response.status === 401) return null;
  if (!response.ok) throw new Error(`Backend request failed: GET ${path} -> HTTP ${response.status}`);
  return (await response.json()) as MemberRegistrationView;
}

/** The member's friends, friend requests and scrim invites (the 好友 tab), or null when not signed in. */
/** A friend's page; null when signed out or when they are not (or no longer) a friend (404). */
export async function fetchMemberFriendProfile(memberId: string): Promise<FriendProfile | null> {
  const token = await memberToken();
  if (!token) return null;
  const path = `/api/member/friends/${encodeURIComponent(memberId)}/profile`;
  const response = await memberFetch(path, {}, token);
  if (response.status === 401 || response.status === 404) return null;
  if (!response.ok) throw new Error(`Backend request failed: GET ${path} -> HTTP ${response.status}`);
  return (await response.json()) as FriendProfile;
}

/**
 * The friends sidebar's data: friends, requests both ways and scrim invites. The root layout reads it
 * on every page, so it never throws: no session, a refused token or any failure is null, and the
 * layout then leaves the sidebar out. Cached per request.
 */
export const fetchMemberFriends = cache(async (): Promise<FriendsOverview | null> => {
  try {
    const token = await memberToken();
    if (!token) return null;
    const response = await memberFetch("/api/member/friends", {}, token);
    if (!response.ok) return null;
    return (await response.json()) as FriendsOverview;
  } catch {
    return null;
  }
});

/** What waits for the member: everything, the friends sidebar's part and the ice creams' part. */
export type PendingSummary = { pending: number; friends: number; iceCreams: number };

const NOTHING_PENDING: PendingSummary = { pending: 0, friends: 0, iceCreams: 0 };

/**
 * What waits for the member, counted by the backend: `friends` (friend requests and scrim invites)
 * for the friends sidebar's handle, `iceCreams` (gifts, redemption requests, new tokens) for the
 * header's Member and the 冰炫風 tab; `pending` (both) is no longer shown.
 * Never throws: no session or a backend failure is all 0, so the layout always renders. Cached per
 * request (the layout and the member page both read it).
 */
export const fetchMemberPendingSummary = cache(async (): Promise<PendingSummary> => {
  try {
    const token = await memberToken();
    if (!token) return NOTHING_PENDING;
    const response = await memberFetch("/api/member/friends/summary", {}, token);
    if (!response.ok) return NOTHING_PENDING;
    return (await response.json()) as PendingSummary;
  } catch {
    return NOTHING_PENDING;
  }
});

const NO_NEWS: NewsSummary = { unread: 0, reminders: [] };

/**
 * The member's unread news count (header) and the messages the reminder popup shows; the backend
 * leaves the popup empty while the member must agree to new terms. Never throws: no session or a
 * backend failure means nothing to show. Cached per request.
 */
export const fetchMemberNewsSummary = cache(async (): Promise<NewsSummary> => {
  try {
    const token = await memberToken();
    if (!token) return NO_NEWS;
    const response = await memberFetch("/api/member/news/summary", {}, token);
    if (!response.ok) return NO_NEWS;
    return (await response.json()) as NewsSummary;
  } catch {
    return NO_NEWS;
  }
});
