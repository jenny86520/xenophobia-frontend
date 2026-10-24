/**
 * Steam OpenID 2.0 sign-in, the site's half: send the visitor to Steam and accept the redirect back.
 * The backend verifies the response with Steam itself; nothing here decides who the visitor is.
 */
export const STEAM_OPENID_ENDPOINT = "https://steamcommunity.com/openid/login";

/** Guest sign-in, or a signed-in member linking their account. */
export type SteamIntent = "guest" | "link";

export function isSteamIntent(value: string | null): value is SteamIntent {
  return value === "guest" || value === "link";
}

/** Short-lived cookie tying Steam's redirect back to the browser that started it (CSRF). */
export const STEAM_STATE_COOKIE = "xpa_steam_state";
export const STEAM_STATE_MAX_AGE_SECONDS = 10 * 60;

/** Why a Steam sign-in did not finish; the pages turn these codes into text. */
export type SteamError = "failed" | "disabled" | "member-account" | "link-refused" | "too-many" | "unavailable";

export const STEAM_ERROR_TEXT: Record<SteamError, string> = {
  failed: "Steam 登入沒有完成或驗證失敗，請再試一次。",
  disabled: "這個訪客帳號已被停用，請聯絡管理員。",
  "member-account": "這個 Steam 帳號已綁定會員，請改用會員帳號登入。",
  "link-refused": "無法綁定：你已經綁定過 Steam，或這個 Steam 帳號已被其他會員使用。如需更換請聯絡管理員。",
  "too-many": "嘗試次數太多，請稍後再試。",
  unavailable: "目前無法完成 Steam 登入，請稍後再試。",
};

export function isSteamError(value: string | undefined): value is SteamError {
  return value !== undefined && Object.prototype.hasOwnProperty.call(STEAM_ERROR_TEXT, value);
}

/**
 * The site's public origin as the visitor sees it. Behind nginx, X-Forwarded-Proto/Host carry it;
 * a spoofed value only yields a return address the backend refuses (it must match MEMBER_PORTAL_URL).
 */
export function siteOrigin(request: Request): string {
  const url = new URL(request.url);
  const proto = request.headers.get("x-forwarded-proto")?.split(",")[0].trim() || url.protocol.replace(/:$/, "");
  const host = request.headers.get("x-forwarded-host")?.split(",")[0].trim() || request.headers.get("host") || url.host;
  return `${proto}://${host}`;
}

/** Steam's login page, asking it to come back to /steam/callback with this intent and state. */
export function steamLoginUrl(origin: string, intent: SteamIntent, state: string): string {
  const returnTo = `${origin}/steam/callback?${new URLSearchParams({ intent, state })}`;
  const query = new URLSearchParams({
    "openid.ns": "http://specs.openid.net/auth/2.0",
    "openid.mode": "checkid_setup",
    "openid.return_to": returnTo,
    "openid.realm": origin,
    "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
    "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
  });
  return `${STEAM_OPENID_ENDPOINT}?${query}`;
}
