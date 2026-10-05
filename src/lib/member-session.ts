import { cookies } from "next/headers";
import { backendBaseUrl } from "@/lib/public-content-client";
import type { MemberProfile, MemberRegistrationView } from "@/types/member";

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

/** Calls the backend, adding the member's token when there is one. Never cached. */
export async function memberFetch(path: string, init: RequestInit = {}, token?: string | null): Promise<Response> {
  const bearer = token === undefined ? await memberToken() : token;
  const headers = new Headers(init.headers);
  if (bearer) headers.set("Authorization", `Bearer ${bearer}`);
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
