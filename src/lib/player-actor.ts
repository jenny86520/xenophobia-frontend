import { memberFetch, memberToken } from "@/lib/member-session";
import { playerToken } from "@/lib/player-session";
import type { ManagedMatch, ViewerMatch } from "@/types/match";

/**
 * Who takes part in a match from this browser: the signed-in member first (their linked Steam
 * account is their player), otherwise the guest signed in with Steam. Each keeps its own cookie.
 */
export type PlayerActor = { kind: "member" | "player"; token: string };

export async function playerActor(): Promise<PlayerActor | null> {
  const member = await memberToken();
  if (member) return { kind: "member", token: member };
  const player = await playerToken();
  return player ? { kind: "player", token: player } : null;
}

/** Calls the backend as that actor (no token when nobody is signed in). */
export async function actorFetch(path: string, init: RequestInit = {}, actor?: PlayerActor | null): Promise<Response> {
  const current = actor === undefined ? await playerActor() : actor;
  return memberFetch(path, init, current?.token ?? null);
}

/**
 * The signed-in view of a match (ratings, the viewer's own sign-up, whether they manage it), or
 * null when nobody is signed in or the backend refuses the token (the page then shows the public view).
 */
export async function fetchViewerMatch(id: string): Promise<ViewerMatch | null> {
  const actor = await playerActor();
  if (!actor) return null;
  const path = `/api/matches/${encodeURIComponent(id)}/viewer`;
  const response = await actorFetch(path, {}, actor);
  if (response.status === 401 || response.status === 404) return null;
  if (!response.ok) throw new Error(`Backend request failed: GET ${path} -> HTTP ${response.status}`);
  return (await response.json()) as ViewerMatch;
}

/** The creating member's management view, or null when they may not manage this match. */
export async function fetchManagedMatch(id: string): Promise<ManagedMatch | null> {
  const token = await memberToken();
  if (!token) return null;
  const path = `/api/matches/${encodeURIComponent(id)}/manage`;
  const response = await memberFetch(path, {}, token);
  if ([401, 403, 404].includes(response.status)) return null;
  if (!response.ok) throw new Error(`Backend request failed: GET ${path} -> HTTP ${response.status}`);
  return (await response.json()) as ManagedMatch;
}
