import {
  backendBaseUrl,
  fetchAboutContent,
  fetchHomeNews,
  fetchLegalDocument,
  fetchPartyDetail,
  fetchPartyList,
} from "./public-content-client";

// connection() needs a Next request scope (and the Request global jsdom lacks).
jest.mock("next/server", () => ({ connection: jest.fn().mockResolvedValue(undefined) }));
const requestHeaders = new Headers();
let memberCookie: string | undefined;
jest.mock("next/headers", () => ({
  headers: () => Promise.resolve(requestHeaders),
  cookies: () =>
    Promise.resolve({ get: (name: string) => (name === "xpa_member" && memberCookie ? { value: memberCookie } : undefined) }),
}));

beforeEach(() => {
  memberCookie = undefined;
});

function mockFetchResponse(status: number, body: unknown) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  }) as jest.Mock;
}

describe("fetchPartyDetail", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns the party when the backend responds with 200", async () => {
    mockFetchResponse(200, { id: "1", title: "Night of Strategy" });
    await expect(fetchPartyDetail("1")).resolves.toEqual({ id: "1", title: "Night of Strategy" });
  });

  it("returns null when the party does not exist (404)", async () => {
    mockFetchResponse(404, { statusCode: 404, error: "NOT_FOUND", message: "Party missing not found" });
    await expect(fetchPartyDetail("missing")).resolves.toBeNull();
  });

  it("throws instead of returning the error body on other failures", async () => {
    mockFetchResponse(500, { statusCode: 500, error: "INTERNAL_SERVER_ERROR", message: "boom" });
    await expect(fetchPartyDetail("1")).rejects.toThrow("HTTP 500");
  });
});

describe("members-only parties", () => {
  const authorizationOf = (call = 0) =>
    ((global.fetch as jest.Mock).mock.calls[call][1] as { headers: Record<string, string> }).headers.Authorization;

  it("sends the member's token for parties and matches, and nothing for visitors", async () => {
    mockFetchResponse(200, []);
    await fetchPartyList("all", "all", "all");
    expect(authorizationOf()).toBeUndefined();

    memberCookie = "member-token";
    mockFetchResponse(200, []);
    await fetchPartyList("active", "online", "all");
    expect(authorizationOf()).toBe("Bearer member-token");
  });

  it("says a visitor may not see a members-only party, without any of its content", async () => {
    mockFetchResponse(403, { statusCode: 403, error: "MEMBERS_ONLY", message: "此活動僅限會員查看" });
    await expect(fetchPartyDetail("secret")).resolves.toEqual({ membersOnly: true });
  });

  it("still throws on a 403 that is not about a members-only party", async () => {
    mockFetchResponse(403, { statusCode: 403, error: "FORBIDDEN", message: "no" });
    await expect(fetchPartyDetail("other")).rejects.toThrow("HTTP 403");
  });
});

describe("visitor address", () => {
  afterEach(() => {
    requestHeaders.delete("x-forwarded-for");
  });

  it("passes the visitor's X-Forwarded-For on to the backend", async () => {
    requestHeaders.set("x-forwarded-for", "203.0.113.9");
    mockFetchResponse(200, { id: "1" });

    await fetchPartyDetail("1");

    const [, init] = (global.fetch as jest.Mock).mock.calls[0] as [string, RequestInit];
    expect(init.headers).toEqual({ "X-Forwarded-For": "203.0.113.9" });
  });

  it("sends no X-Forwarded-For when the request had none", async () => {
    mockFetchResponse(200, { id: "1" });

    await fetchPartyDetail("1");

    const [, init] = (global.fetch as jest.Mock).mock.calls[0] as [string, RequestInit];
    expect(init.headers).toEqual({});
  });
});

describe("backendBaseUrl", () => {
  const original = { ...process.env };
  afterEach(() => {
    process.env = { ...original };
  });

  it("prefers BACKEND_URL (server-side address) over NEXT_PUBLIC_BACKEND_URL", () => {
    process.env.BACKEND_URL = "http://backend.internal:3001";
    process.env.NEXT_PUBLIC_BACKEND_URL = "https://api.example.com";
    expect(backendBaseUrl()).toBe("http://backend.internal:3001");
  });

  it("falls back to NEXT_PUBLIC_BACKEND_URL, then localhost", () => {
    delete process.env.BACKEND_URL;
    process.env.NEXT_PUBLIC_BACKEND_URL = "https://api.example.com";
    expect(backendBaseUrl()).toBe("https://api.example.com");
    delete process.env.NEXT_PUBLIC_BACKEND_URL;
    expect(backendBaseUrl()).toBe("http://localhost:3001");
  });
});

describe("fetchPartyList", () => {
  it("omits filters whose value is all", async () => {
    mockFetchResponse(200, []);
    await fetchPartyList("expired", "all", "games");
    const [url] = (global.fetch as jest.Mock).mock.calls[0] as [string];
    expect(url.endsWith("/api/parties?status=expired&category=games")).toBe(true);
  });

  it("asks the backend for newest first, leaving its default asc out", async () => {
    mockFetchResponse(200, []);
    await fetchPartyList("active", "all", "all", "desc");
    const [url] = (global.fetch as jest.Mock).mock.calls[0] as [string];
    expect(url.endsWith("/api/parties?status=active&order=desc")).toBe(true);
  });
});

describe("fetchLegalDocument", () => {
  it("reads a document by key", async () => {
    const doc = { key: "terms", title: "使用條款", content: "內容", version: 2, updatedAt: "2026-11-01T02:00:00.000Z" };
    mockFetchResponse(200, doc);
    await expect(fetchLegalDocument("terms")).resolves.toEqual(doc);
    expect((global.fetch as jest.Mock).mock.calls[0][0]).toMatch(/\/api\/legal\/terms$/);
  });

  it("is null on 404 and throws on other failures", async () => {
    mockFetchResponse(404, {});
    await expect(fetchLegalDocument("privacy")).resolves.toBeNull();
    mockFetchResponse(500, {});
    await expect(fetchLegalDocument("privacy")).rejects.toThrow("HTTP 500");
  });
});

describe("fetchAboutContent", () => {
  it("throws when the backend fails", async () => {
    mockFetchResponse(500, {});
    await expect(fetchAboutContent()).rejects.toThrow("HTTP 500");
  });
});

describe("fetchHomeNews", () => {
  it("asks for the five newest 最新消息 with the member token and returns the items", async () => {
    memberCookie = "member-token";
    mockFetchResponse(200, { items: [{ id: "n1" }], total: 1, page: 1, pageSize: 5 });
    await expect(fetchHomeNews()).resolves.toEqual([{ id: "n1" }]);
    const [url, init] = (global.fetch as jest.Mock).mock.calls[0];
    const query = new URL(url).searchParams;
    expect(new URL(url).pathname).toBe("/api/news");
    expect(query.get("category")).toBe("news");
    expect(query.get("page")).toBe("1");
    expect(query.get("pageSize")).toBe("5");
    expect(init.headers.Authorization).toBe("Bearer member-token");
  });

  it("throws when the backend fails", async () => {
    mockFetchResponse(500, {});
    await expect(fetchHomeNews()).rejects.toThrow("HTTP 500");
  });
});
