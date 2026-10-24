import http from "node:http";
import https from "node:https";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import type { ReadableStream as NodeReadableStream } from "node:stream/web";
import { forwardedForHeader } from "@/lib/forwarded-for";
import { clearMemberToken, memberToken } from "@/lib/member-session";
import { backendBaseUrl } from "@/lib/public-content-client";

/**
 * Same-site relay for a member's video upload (POST /member/videos/upload, multipart).
 *
 * The browser cannot call the member API itself (the token is in an httpOnly cookie), and a Server
 * Action shows no upload progress, so the upload form posts here with XMLHttpRequest and this
 * handler streams the body straight on to the backend with the member's token. Every rule
 * (permission, daily limit, file type and size) is the backend's; its answer is passed back as is.
 *
 * Memory must not grow with the file (up to 500 MB):
 * - Next.js only buffers request bodies (with a 10 MB cap) when a proxy file is in use, so this app
 *   must not add a `proxy.ts`.
 * - The body goes on through node:http with stream.pipeline, which waits whenever the backend is
 *   slower. fetch() with a streamed body does not: measured, it kept the whole upload in memory.
 */
export async function POST(request: Request): Promise<Response> {
  // Server Actions get Next's own origin check; a Route Handler does not, so refuse cross-site posts.
  if (!isSameOrigin(request)) {
    return Response.json({ message: "請從本站的投稿頁上傳" }, { status: 403 });
  }
  const token = await memberToken();
  if (!token) {
    return Response.json({ message: "請先登入會員" }, { status: 401 });
  }

  const headers: Record<string, string> = { ...(await forwardedForHeader()), Authorization: `Bearer ${token}` };
  // Keeps the multipart boundary.
  const contentType = request.headers.get("content-type");
  if (contentType) headers["Content-Type"] = contentType;

  let answer: BackendAnswer;
  try {
    answer = await relay(new URL("/api/member/video-submissions/upload", backendBaseUrl()), headers, request.body);
  } catch {
    return Response.json({ message: "目前無法連線，請稍後再試" }, { status: 502 });
  }

  // The session expired or the member was disabled: drop the cookie, as the Server Actions do.
  if (answer.status === 401) await clearMemberToken();
  return new Response(answer.body, {
    status: answer.status,
    headers: { "Content-Type": answer.contentType ?? "application/json" },
  });
}

type BackendAnswer = { status: number; contentType: string | undefined; body: string };

/** POSTs the body stream to the backend with backpressure and resolves with its (small JSON) answer. */
function relay(url: URL, headers: Record<string, string>, body: ReadableStream<Uint8Array> | null) {
  return new Promise<BackendAnswer>((resolve, reject) => {
    let answered = false;
    const outgoing = (url.protocol === "https:" ? https : http).request(url, { method: "POST", headers }, (incoming) => {
      answered = true;
      let text = "";
      incoming.setEncoding("utf8");
      incoming.on("data", (chunk: string) => (text += chunk));
      incoming.on("end", () =>
        resolve({ status: incoming.statusCode ?? 502, contentType: incoming.headers["content-type"], body: text }),
      );
      incoming.on("error", reject);
    });
    outgoing.on("error", (error) => {
      if (!answered) reject(error);
    });
    // The backend may answer and close before reading everything (e.g. 401): that answer still counts.
    outgoing.on("close", () => {
      if (!answered) reject(new Error("The backend closed the connection without answering"));
    });
    if (body) {
      pipeline(Readable.fromWeb(body as NodeReadableStream<Uint8Array>), outgoing).catch(() => {
        // A failed upload destroys `outgoing`, which reports it through "error" or "close" above.
      });
    } else {
      outgoing.end();
    }
  });
}

/** The Origin header names this site (the host the browser reached, through nginx or not). */
function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
