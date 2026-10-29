import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { memberToken } from "@/lib/member-session";
import {
  STEAM_STATE_COOKIE,
  STEAM_STATE_MAX_AGE_SECONDS,
  isSteamIntent,
  siteOrigin,
  steamLoginUrl,
} from "@/lib/steam-login";

/**
 * GET /steam/login?intent=guest|member|link: sends the visitor to Steam's login page. A random state
 * goes both into Steam's return address and into a short-lived cookie; /steam/callback accepts only
 * a redirect carrying the state this browser was given. Linking needs a signed-in member; signing in
 * as a member (intent=member) does not.
 */
export async function GET(request: Request): Promise<Response> {
  const origin = siteOrigin(request);
  const intent = new URL(request.url).searchParams.get("intent");
  if (!isSteamIntent(intent)) return Response.redirect(`${origin}/member/login`, 303);
  if (intent === "link" && !(await memberToken())) return Response.redirect(`${origin}/member/login`, 303);

  const state = randomBytes(16).toString("base64url");
  (await cookies()).set(STEAM_STATE_COOKIE, `${intent}.${state}`, {
    httpOnly: true,
    // Steam's redirect back is a top-level GET, which still carries a lax cookie.
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/steam",
    maxAge: STEAM_STATE_MAX_AGE_SECONDS,
  });
  return Response.redirect(steamLoginUrl(origin, intent, state), 303);
}
