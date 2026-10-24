/**
 * @jest-environment node
 */
// The node environment has the Request/Response/ReadableStream globals a Route Handler uses, and the
// handler talks to a real local HTTP server standing in for the backend.
import http from "node:http";
import type { AddressInfo } from "node:net";

const cookieStore = { get: jest.fn(), set: jest.fn(), delete: jest.fn() };
const requestHeaders = new Headers();
jest.mock("next/server", () => ({ connection: jest.fn().mockResolvedValue(undefined) }));
jest.mock("next/headers", () => ({
  cookies: () => Promise.resolve(cookieStore),
  headers: () => Promise.resolve(requestHeaders),
}));

import { POST } from "./route";

type Received = { method?: string; url?: string; headers: http.IncomingHttpHeaders; body: string };

let backend: http.Server;
let received: Received[] = [];
let answer: { status: number; body: unknown } = { status: 201, body: {} };
let backendUrl = "";

beforeAll(async () => {
  backend = http.createServer((req, res) => {
    let body = "";
    req.setEncoding("utf8");
    req.on("data", (chunk: string) => (body += chunk));
    req.on("end", () => {
      received.push({ method: req.method, url: req.url, headers: req.headers, body });
      res.writeHead(answer.status, { "content-type": "application/json; charset=utf-8" });
      res.end(JSON.stringify(answer.body));
    });
  });
  await new Promise<void>((resolve) => backend.listen(0, "127.0.0.1", resolve));
  backendUrl = `http://127.0.0.1:${(backend.address() as AddressInfo).port}`;
});

afterAll(() => new Promise<void>((resolve) => backend.close(() => resolve())));

function upload(headers: Record<string, string> = {}) {
  return new Request("http://localhost:3000/member/videos/upload", {
    method: "POST",
    headers: {
      host: "localhost:3000",
      origin: "http://localhost:3000",
      "content-type": "multipart/form-data; boundary=xyz",
      ...headers,
    },
    body: "--xyz\r\nfile-bytes\r\n--xyz--",
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  received = [];
  answer = { status: 201, body: { id: "s1", status: "pending" } };
  process.env.BACKEND_URL = backendUrl;
  cookieStore.get.mockReturnValue({ value: "jwt" });
  requestHeaders.set("x-forwarded-for", "203.0.113.5");
});

afterAll(() => {
  delete process.env.BACKEND_URL;
});

describe("POST /member/videos/upload", () => {
  it("refuses a post from another site, or without an Origin, before reaching the backend", async () => {
    expect((await POST(upload({ origin: "https://evil.example" }))).status).toBe(403);
    const noOrigin = new Request("http://localhost:3000/member/videos/upload", {
      method: "POST",
      headers: { host: "localhost:3000" },
      body: "x",
    });
    expect((await POST(noOrigin)).status).toBe(403);
    expect(received).toEqual([]);
  });

  it("accepts the origin nginx forwarded the host for", async () => {
    const response = await POST(
      upload({ host: "frontend:3000", "x-forwarded-host": "xpa.example", origin: "https://xpa.example" }),
    );
    expect(response.status).toBe(201);
  });

  it("answers 401 without a session, before reaching the backend", async () => {
    cookieStore.get.mockReturnValue(undefined);
    expect((await POST(upload())).status).toBe(401);
    expect(received).toEqual([]);
  });

  it("streams the body to the backend with the token, the boundary and the visitor's address", async () => {
    const response = await POST(upload());

    expect(received).toHaveLength(1);
    const [sent] = received;
    expect(sent.method).toBe("POST");
    expect(sent.url).toBe("/api/member/video-submissions/upload");
    expect(sent.body).toBe("--xyz\r\nfile-bytes\r\n--xyz--");
    expect(sent.headers.authorization).toBe("Bearer jwt");
    expect(sent.headers["content-type"]).toBe("multipart/form-data; boundary=xyz");
    expect(sent.headers["x-forwarded-for"]).toBe("203.0.113.5");
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ id: "s1", status: "pending" });
  });

  it("passes the backend's refusal back unchanged", async () => {
    answer = { status: 429, body: { statusCode: 429, message: "今天的上傳次數已用完" } };

    const response = await POST(upload());

    expect(response.status).toBe(429);
    expect(await response.json()).toEqual({ statusCode: 429, message: "今天的上傳次數已用完" });
    expect(cookieStore.delete).not.toHaveBeenCalled();
  });

  it("drops the cookie when the backend refuses the session", async () => {
    answer = { status: 401, body: { statusCode: 401, message: "Unauthorized" } };

    const response = await POST(upload());

    expect(response.status).toBe(401);
    expect(cookieStore.delete).toHaveBeenCalledWith("xpa_member");
  });

  it("answers 502 when the backend cannot be reached", async () => {
    // A port nothing listens on: grab one, then close it.
    const closed = http.createServer();
    await new Promise<void>((resolve) => closed.listen(0, "127.0.0.1", resolve));
    const { port } = closed.address() as AddressInfo;
    await new Promise<void>((resolve) => closed.close(() => resolve()));
    process.env.BACKEND_URL = `http://127.0.0.1:${port}`;

    expect((await POST(upload())).status).toBe(502);
  });
});
