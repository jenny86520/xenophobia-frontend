import { fetchPartyDetail } from "./public-content-client";

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
