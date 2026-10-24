/**
 * @jest-environment node
 */
// The node environment has the Request/Response globals the Route Handlers use; the backend calls
// and cookies are mocked.
const cookieValues = new Map<string, string>();
const cookieStore = {
  get: jest.fn((name: string) => (cookieValues.has(name) ? { value: cookieValues.get(name) } : undefined)),
  set: jest.fn((name: string, value: string) => cookieValues.set(name, value)),
  delete: jest.fn((options: string | { name: string }) =>
    cookieValues.delete(typeof options === "string" ? options : options.name),
  ),
};
jest.mock("next/headers", () => ({ cookies: () => Promise.resolve(cookieStore) }));

const memberFetch = jest.fn();
const memberToken = jest.fn();
const clearMemberToken = jest.fn();
const setPlayerToken = jest.fn();
jest.mock("@/lib/member-session", () => ({
  memberFetch: (...args: unknown[]) => memberFetch(...args),
  memberToken: () => memberToken(),
  clearMemberToken: () => clearMemberToken(),
}));
jest.mock("@/lib/player-session", () => ({
  setPlayerToken: (...args: unknown[]) => setPlayerToken(...args),
}));

import { GET as callback } from "./callback/route";
import { GET as login } from "./login/route";

const SITE = "http://localhost:3000";

const steamRedirect = (intent: string, state: string, extra: Record<string, string> = {}) =>
  new Request(
    `${SITE}/steam/callback?${new URLSearchParams({
      intent,
      state,
      "openid.mode": "id_res",
      "openid.claimed_id": "https://steamcommunity.com/openid/id/76561198000000001",
      ...extra,
    })}`,
  );

const json = (status: number, body: unknown) => Promise.resolve(Response.json(body, { status }));

beforeEach(() => {
  jest.clearAllMocks();
  cookieValues.clear();
  memberToken.mockResolvedValue(null);
});

describe("GET /steam/login", () => {
  it("sends a guest to Steam with a state in the return address and in a cookie", async () => {
    const response = await login(new Request(`${SITE}/steam/login?intent=guest`));

    expect(response.status).toBe(303);
    const target = new URL(response.headers.get("location") as string);
    expect(target.origin + target.pathname).toBe("https://steamcommunity.com/openid/login");
    expect(target.searchParams.get("openid.mode")).toBe("checkid_setup");
    expect(target.searchParams.get("openid.realm")).toBe(SITE);
    const returnTo = new URL(target.searchParams.get("openid.return_to") as string);
    expect(returnTo.origin + returnTo.pathname).toBe(`${SITE}/steam/callback`);
    const state = returnTo.searchParams.get("state");
    expect(cookieValues.get("xpa_steam_state")).toBe(`guest.${state}`);
  });

  it("uses the public origin nginx forwards", async () => {
    const response = await login(
      new Request("http://frontend:3000/steam/login?intent=guest", {
        headers: { "x-forwarded-proto": "https", "x-forwarded-host": "xpa.example" },
      }),
    );
    const target = new URL(response.headers.get("location") as string);
    expect(target.searchParams.get("openid.realm")).toBe("https://xpa.example");
  });

  it("sends a member who is not signed in, or an unknown intent, to the login page", async () => {
    for (const intent of ["link", "other"]) {
      const response = await login(new Request(`${SITE}/steam/login?intent=${intent}`));
      expect(response.headers.get("location")).toBe(`${SITE}/member/login`);
    }
    expect(cookieStore.set).not.toHaveBeenCalled();
  });
});

describe("GET /steam/callback", () => {
  it("refuses a redirect whose state this browser was not given, without asking the backend", async () => {
    cookieValues.set("xpa_steam_state", "guest.right");

    const response = await callback(steamRedirect("guest", "wrong"));

    expect(response.headers.get("location")).toBe(`${SITE}/member/login?steam=failed`);
    expect(memberFetch).not.toHaveBeenCalled();
    expect(cookieValues.has("xpa_steam_state")).toBe(false);
  });

  it("signs a guest in with the openid parameters only, then opens the player page", async () => {
    cookieValues.set("xpa_steam_state", "guest.s1");
    memberFetch.mockReturnValue(json(200, { accessToken: "player-token", expiresIn: 604800, needsNickname: true }));

    const response = await callback(steamRedirect("guest", "s1"));

    expect(response.headers.get("location")).toBe(`${SITE}/player`);
    const [path, init, token] = memberFetch.mock.calls[0] as [string, RequestInit, null];
    expect(path).toBe("/api/player-auth/steam");
    expect(token).toBeNull();
    expect(JSON.parse(String(init.body))).toEqual({
      params: {
        "openid.mode": "id_res",
        "openid.claimed_id": "https://steamcommunity.com/openid/id/76561198000000001",
      },
    });
    expect(setPlayerToken).toHaveBeenCalledWith("player-token", 604800);
  });

  it.each([
    [401, "failed"],
    [403, "disabled"],
    [409, "member-account"],
    [429, "too-many"],
    [500, "unavailable"],
  ])("sends a guest back with a reason when the backend answers %i", async (status, code) => {
    cookieValues.set("xpa_steam_state", "guest.s1");
    memberFetch.mockReturnValue(json(status, { message: "x" }));

    const response = await callback(steamRedirect("guest", "s1"));

    expect(response.headers.get("location")).toBe(`${SITE}/member/login?steam=${code}`);
    expect(setPlayerToken).not.toHaveBeenCalled();
  });

  it("links a signed-in member's account and returns to the member page", async () => {
    cookieValues.set("xpa_steam_state", "link.s2");
    memberToken.mockResolvedValue("member-token");
    memberFetch.mockReturnValue(json(200, { steamId: "76561198000000001" }));

    const response = await callback(steamRedirect("link", "s2"));

    expect(response.headers.get("location")).toBe(`${SITE}/member?steam=linked`);
    expect(memberFetch.mock.calls[0][0]).toBe("/api/member/steam");
    expect(memberFetch.mock.calls[0][2]).toBe("member-token");
  });

  it("says why a link was refused, and drops an expired member session", async () => {
    cookieValues.set("xpa_steam_state", "link.s3");
    memberToken.mockResolvedValue("member-token");
    memberFetch.mockReturnValue(json(409, { message: "x" }));
    expect((await callback(steamRedirect("link", "s3"))).headers.get("location")).toBe(
      `${SITE}/member?steam=link-refused`,
    );

    cookieValues.set("xpa_steam_state", "link.s4");
    memberFetch.mockReturnValue(json(401, { message: "x" }));
    expect((await callback(steamRedirect("link", "s4"))).headers.get("location")).toBe(`${SITE}/member/login`);
    expect(clearMemberToken).toHaveBeenCalled();
  });

  it("treats a cancelled Steam login as a failure", async () => {
    cookieValues.set("xpa_steam_state", "guest.s5");

    const response = await callback(steamRedirect("guest", "s5", { "openid.mode": "cancel" }));

    expect(response.headers.get("location")).toBe(`${SITE}/member/login?steam=failed`);
    expect(memberFetch).not.toHaveBeenCalled();
  });
});
