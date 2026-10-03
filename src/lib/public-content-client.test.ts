import {
  backendBaseUrl,
  fetchAboutContent,
  fetchPartyDetail,
  fetchPartyList,
} from "./public-content-client";

// connection() needs a Next request scope (and the Request global jsdom lacks).
jest.mock("next/server", () => ({ connection: jest.fn().mockResolvedValue(undefined) }));

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
});

describe("fetchAboutContent", () => {
  it("throws when the backend fails", async () => {
    mockFetchResponse(500, {});
    await expect(fetchAboutContent()).rejects.toThrow("HTTP 500");
  });
});
