import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { memberToken } from "@/lib/member-session";
import {
  STEAM_LINK_COOKIE,
  STEAM_STATE_COOKIE,
  STEAM_STATE_MAX_AGE_SECONDS,
  isSteamIntent,
  siteOrigin,
  steamCookieOptions,
  steamLoginUrl,
} from "@/lib/steam-login";

/**
 * GET /steam/login?intent=guest|member|link: sends the visitor to Steam's login page. A random state
 * goes both into Steam's return address and into a short-lived cookie; /steam/callback accepts only
 * a redirect carrying the state this browser was given. Linking needs a signed-in member who has just
 * typed their password again (the link-ticket cookie); signing in as a member (intent=member) does not.
 */
export async function GET(request: Request): Promise<Response> {
  const origin = siteOrigin(request);
  const intent = new URL(request.url).searchParams.get("intent");
  if (!isSteamIntent(intent)) return Response.redirect(`${origin}/member/login`, 303);
  const store = await cookies();
  if (intent === "link") {
    if (!(await memberToken())) return Response.redirect(`${origin}/member/login`, 303);
    // Linking needs the password typed again first (the ticket's validity is the backend's call).
    if (!store.get(STEAM_LINK_COOKIE)) return Response.redirect(`${origin}/member?steam=reauth-required`, 303);
  }

  const state = randomBytes(16).toString("base64url");
  // Steam's redirect back is a top-level GET, which still carries a lax cookie.
  store.set(STEAM_STATE_COOKIE, `${intent}.${state}`, steamCookieOptions(STEAM_STATE_MAX_AGE_SECONDS));
  return Response.redirect(steamLoginUrl(origin, intent, state), 303);
}
