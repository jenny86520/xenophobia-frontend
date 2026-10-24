import { cookies } from "next/headers";
import { clearMemberToken, memberFetch, memberToken } from "@/lib/member-session";
import { setPlayerToken } from "@/lib/player-session";
import { STEAM_STATE_COOKIE, type SteamError, isSteamIntent, siteOrigin } from "@/lib/steam-login";

type GuestLogin = { accessToken: string; expiresIn: number; needsNickname: boolean };

/**
 * GET /steam/callback: Steam's redirect back. The state must match the cookie /steam/login set;
 * then the openid.* parameters go to the backend, which verifies them with Steam. A guest gets the
 * `xpa_player` cookie and the player page; a member's link ends on the member page. Failures go
 * back with an error code the page turns into text.
 */
export async function GET(request: Request): Promise<Response> {
  const origin = siteOrigin(request);
  const url = new URL(request.url);
  const intent = url.searchParams.get("intent");
  const state = url.searchParams.get("state");

  const store = await cookies();
  const expected = store.get(STEAM_STATE_COOKIE)?.value;
  store.delete({ name: STEAM_STATE_COOKIE, path: "/steam" });

  const back = (error: SteamError) =>
    Response.redirect(`${origin}${intent === "link" ? "/member" : "/member/login"}?steam=${error}`, 303);
  if (!isSteamIntent(intent) || !state || expected !== `${intent}.${state}`) return back("failed");

  const params = Object.fromEntries([...url.searchParams].filter(([name]) => name.startsWith("openid.")));
  if (params["openid.mode"] !== "id_res") return back("failed");

  let response: Response;
  try {
    if (intent === "guest") {
      response = await memberFetch(
        "/api/player-auth/steam",
        { method: "POST", body: JSON.stringify({ params }) },
        null,
      );
    } else {
      const token = await memberToken();
      if (!token) return Response.redirect(`${origin}/member/login`, 303);
      response = await memberFetch("/api/member/steam", { method: "POST", body: JSON.stringify({ params }) }, token);
    }
  } catch {
    return back("unavailable");
  }

  if (response.ok) {
    if (intent === "link") return Response.redirect(`${origin}/member?steam=linked`, 303);
    const login = (await response.json()) as GuestLogin;
    await setPlayerToken(login.accessToken, login.expiresIn);
    return Response.redirect(`${origin}/player`, 303);
  }
  if (response.status === 401 && intent === "link") {
    // Either Steam's answer or the member session was refused; a stale session must go.
    if ((await memberFetch("/api/member/me")).status === 401) {
      await clearMemberToken();
      return Response.redirect(`${origin}/member/login`, 303);
    }
  }
  if (response.status === 401) return back("failed");
  if (response.status === 403) return back("disabled");
  if (response.status === 409) return back(intent === "guest" ? "member-account" : "link-refused");
  if (response.status === 429) return back("too-many");
  return back("unavailable");
}
