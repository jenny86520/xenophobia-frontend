import { cookies } from "next/headers";
import { memberCookieOptions, memberFetch } from "@/lib/member-session";
import type { GuestPlayer } from "@/types/player";

/**
 * A guest player's token (Steam login without a member account) lives only in this httpOnly cookie,
 * separate from the member's `xpa_member`; only the backend's player routes accept it.
 */
export const PLAYER_COOKIE = "xpa_player";

export async function playerToken(): Promise<string | null> {
  return (await cookies()).get(PLAYER_COOKIE)?.value ?? null;
}

/** Only callable from a Server Action or a Route Handler. */
export async function setPlayerToken(token: string, maxAgeSeconds: number): Promise<void> {
  (await cookies()).set(PLAYER_COOKIE, token, memberCookieOptions(maxAgeSeconds));
}

/** Only callable from a Server Action or a Route Handler. */
export async function clearPlayerToken(): Promise<void> {
  (await cookies()).delete(PLAYER_COOKIE);
}

/** Calls the backend with the guest's token (none when signed out). */
export async function playerFetch(path: string, init: RequestInit = {}): Promise<Response> {
  return memberFetch(path, init, await playerToken());
}

/**
 * The signed-in guest, or null when there is no session or the backend refuses it (disabled,
 * deleted, or now linked to a member). Pages cannot write cookies, so a stale one is cleared by the
 * next Server Action.
 */
export async function fetchGuestPlayer(): Promise<GuestPlayer | null> {
  if (!(await playerToken())) return null;
  const response = await playerFetch("/api/player/me");
  if (response.status === 401) return null;
  if (!response.ok) throw new Error(`Failed to load the player: HTTP ${response.status}`);
  return (await response.json()) as GuestPlayer;
}
