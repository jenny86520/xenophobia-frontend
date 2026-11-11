/**
 * @jest-environment node
 */
// The node environment has the Request/Response globals a Route Handler uses, and the handler talks
// to a real local HTTP server standing in for the backend.
import http from "node:http";
import type { AddressInfo } from "node:net";

const cookieStore = { get: jest.fn(), set: jest.fn(), delete: jest.fn() };
const requestHeaders = new Headers();
jest.mock("next/server", () => ({
  connection: jest.fn().mockResolvedValue(undefined),
}));
jest.mock("next/headers", () => ({
  cookies: () => Promise.resolve(cookieStore),
  headers: () => Promise.resolve(requestHeaders),
}));

import { GET } from "./route";

type Received = { url?: string; headers: http.IncomingHttpHeaders };

let backend: http.Server;
let received: Received[] = [];
let answer: { status: number; headers: Record<string, string>; body: string } = {
  status: 200,
  headers: {},
  body: "",
};
let backendUrl = "";

beforeAll(async () => {
  backend = http.createServer((req, res) => {
    received.push({ url: req.url, headers: req.headers });
    res.writeHead(answer.status, answer.headers);
    res.end(answer.body);
  });
  await new Promise<void>((resolve) => backend.listen(0, "127.0.0.1", resolve));
  backendUrl = `http://127.0.0.1:${(backend.address() as AddressInfo).port}`;
});

afterAll(() => new Promise<void>((resolve) => backend.close(() => resolve())));

/** Which session cookies the browser holds. */
function signedInAs(cookies: { member?: string; player?: string }) {
  cookieStore.get.mockImplementation((name: string) => {
    const value = name === "xpa_member" ? cookies.member : name === "xpa_player" ? cookies.player : undefined;
    return value ? { value } : undefined;
  });
}

const download = (id = "m1") =>
  GET(new Request(`http://localhost:3000/matches/${id}/demo`), {
    params: Promise.resolve({ id }),
  } as RouteContext<"/matches/[id]/demo">);

beforeEach(() => {
  jest.clearAllMocks();
  received = [];
  answer = {
    status: 200,
    headers: {
      "content-type": "application/octet-stream",
      "content-disposition": 'attachment; filename="m1-Inferno.dem"',
      "x-content-type-options": "nosniff",
    },
    body: "DEMO-BYTES",
  };
  process.env.BACKEND_URL = backendUrl;
  requestHeaders.set("x-forwarded-for", "203.0.113.5");
});

afterAll(() => {
  delete process.env.BACKEND_URL;
});

describe("GET /matches/[id]/demo", () => {
  it("answers 401 without a session, before reaching the backend", async () => {
    signedInAs({});
    const response = await download();
    expect(response.status).toBe(401);
    expect(await response.text()).toBe("請先登入");
    expect(received).toEqual([]);
  });

  it("streams the file from the backend as the signed-in member, with the save-as name", async () => {
    signedInAs({ member: "member-jwt", player: "guest-jwt" });
    const response = await download();

    expect(received).toHaveLength(1);
    expect(received[0].url).toBe("/api/matches/m1/demo");
    expect(received[0].headers.authorization).toBe("Bearer member-jwt");
    expect(received[0].headers["x-forwarded-for"]).toBe("203.0.113.5");
    expect(response.status).toBe(200);
    expect(response.headers.get("content-disposition")).toBe('attachment; filename="m1-Inferno.dem"');
    expect(response.headers.get("content-type")).toBe("application/octet-stream");
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(await response.text()).toBe("DEMO-BYTES");
  });

  it("asks as the Steam guest when no member is signed in", async () => {
    signedInAs({ player: "guest-jwt" });
    await download();
    expect(received[0].headers.authorization).toBe("Bearer guest-jwt");
  });

  it("passes refusals back in words, keeping the session", async () => {
    signedInAs({ member: "member-jwt" });
    answer = {
      status: 403,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        statusCode: 403,
        message: "只有這場的參賽者與建立者可以下載 demo",
      }),
    };
    const forbidden = await download();
    expect(forbidden.status).toBe(403);
    expect(await forbidden.text()).toBe("只有這場的參賽者與建立者可以下載 demo");

    answer = {
      status: 404,
      headers: { "content-type": "application/json" },
      body: "{}",
    };
    const missing = await download();
    expect(missing.status).toBe(404);
    expect(await missing.text()).toBe("無法下載 demo");
    expect(cookieStore.delete).not.toHaveBeenCalled();
  });

  it("drops the guest cookie the backend refused", async () => {
    signedInAs({ player: "guest-jwt" });
    answer = {
      status: 401,
      headers: { "content-type": "application/json" },
      body: "{}",
    };
    expect((await download()).status).toBe(401);
    expect(cookieStore.delete).toHaveBeenCalledWith("xpa_player");
  });
});
