const cookieStore = { get: jest.fn(), set: jest.fn(), delete: jest.fn() };
// connection() in public-content-client needs a Next request scope (and the Request global jsdom lacks).
jest.mock("next/server", () => ({ connection: jest.fn().mockResolvedValue(undefined) }));
const requestHeaders = new Headers();
jest.mock("next/headers", () => ({
  cookies: () => Promise.resolve(cookieStore),
  headers: () => Promise.resolve(requestHeaders),
}));

import {
  MEMBER_COOKIE,
  fetchMemberProfile,
  memberCookieOptions,
  memberFetch,
  setMemberToken,
} from "./member-session";

function respond(status: number, body: unknown = {}) {
  global.fetch = jest.fn().mockResolvedValue({
    status,
    ok: status >= 200 && status < 300,
    json: () => Promise.resolve(body),
  }) as unknown as typeof fetch;
}

beforeEach(() => {
  jest.clearAllMocks();
  cookieStore.get.mockReturnValue(undefined);
  requestHeaders.delete("x-forwarded-for");
});

describe("member cookie", () => {
  it("is httpOnly, same-site lax, site-wide and lives as long as the token", async () => {
    expect(memberCookieOptions(604800)).toMatchObject({ httpOnly: true, sameSite: "lax", path: "/", maxAge: 604800 });

    await setMemberToken("jwt", 604800);
    expect(cookieStore.set).toHaveBeenCalledWith(MEMBER_COOKIE, "jwt", expect.objectContaining({ httpOnly: true }));
  });
});

describe("memberFetch", () => {
  it("passes the visitor's X-Forwarded-For on to the backend", async () => {
    requestHeaders.set("x-forwarded-for", "203.0.113.5, 10.0.0.2");
    respond(200);

    await memberFetch("/api/member/auth/login", { method: "POST", body: "{}" }, null);

    const [, init] = (global.fetch as jest.Mock).mock.calls[0] as [string, RequestInit];
    expect(new Headers(init.headers).get("X-Forwarded-For")).toBe("203.0.113.5, 10.0.0.2");
  });

  it("sends no X-Forwarded-For when the request had none", async () => {
    respond(200);

    await memberFetch("/api/member/auth/login", { method: "POST", body: "{}" }, null);

    const [, init] = (global.fetch as jest.Mock).mock.calls[0] as [string, RequestInit];
    expect(new Headers(init.headers).has("X-Forwarded-For")).toBe(false);
  });

  it("sends the member token from the cookie and never caches", async () => {
    cookieStore.get.mockReturnValue({ value: "jwt" });
    respond(200);

    await memberFetch("/api/member/me", { method: "PATCH", body: "{}" });

    const [url, init] = (global.fetch as jest.Mock).mock.calls[0] as [string, RequestInit];
    expect(url).toMatch(/\/api\/member\/me$/);
    expect(init.cache).toBe("no-store");
    const headers = new Headers(init.headers);
    expect(headers.get("Authorization")).toBe("Bearer jwt");
    expect(headers.get("Content-Type")).toBe("application/json");
  });

  it("sends no token when told not to", async () => {
    cookieStore.get.mockReturnValue({ value: "jwt" });
    respond(200);

    await memberFetch("/api/member/auth/login", { method: "POST", body: "{}" }, null);

    const init = (global.fetch as jest.Mock).mock.calls[0][1] as RequestInit;
    expect(new Headers(init.headers).has("Authorization")).toBe(false);
  });
});

describe("fetchMemberProfile", () => {
  it("is null without a session, and without calling the backend", async () => {
    respond(200);
    await expect(fetchMemberProfile()).resolves.toBeNull();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("is null when the backend refuses the token", async () => {
    cookieStore.get.mockReturnValue({ value: "expired" });
    respond(401);
    await expect(fetchMemberProfile()).resolves.toBeNull();
  });

  it("throws on other failures", async () => {
    cookieStore.get.mockReturnValue({ value: "jwt" });
    respond(500);
    await expect(fetchMemberProfile()).rejects.toThrow("HTTP 500");
  });
});
