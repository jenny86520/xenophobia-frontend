import { forwardedForHeader } from "@/lib/forwarded-for";
import { clearMemberToken } from "@/lib/member-session";
import { playerActor } from "@/lib/player-actor";
import { clearPlayerToken } from "@/lib/player-session";
import { backendBaseUrl } from "@/lib/public-content-client";

/** Headers of the backend's answer the browser needs to save the file. */
const PASSED_ON = ["content-type", "content-length", "content-disposition", "x-content-type-options"];

/**
 * Same-site relay for a match demo (GET /matches/<id>/demo): the browser cannot call the API with
 * the httpOnly session cookie, so this handler asks the backend as the signed-in member or Steam
 * guest and streams the file back (the response body is passed on as a stream, never buffered).
 * Who may download is the backend's rule; 401, 403 and 404 come back as they are, in words.
 * A GET changes nothing, so no Origin check is needed.
 */
export async function GET(_request: Request, { params }: RouteContext<"/matches/[id]/demo">): Promise<Response> {
  const { id } = await params;
  const actor = await playerActor();
  if (!actor) return text("請先登入", 401);

  let answer: Response;
  try {
    answer = await fetch(new URL(`/api/matches/${encodeURIComponent(id)}/demo`, backendBaseUrl()), {
      headers: {
        ...(await forwardedForHeader()),
        Authorization: `Bearer ${actor.token}`,
      },
      cache: "no-store",
    });
  } catch {
    return text("目前無法連線，請稍後再試", 502);
  }

  if (!answer.ok) {
    // The session expired or the account was disabled: drop the cookie that was used, as the actions do.
    if (answer.status === 401) {
      await (actor.kind === "member" ? clearMemberToken() : clearPlayerToken());
    }
    const message = await answer
      .json()
      .then((body: { message?: unknown }) => (typeof body.message === "string" ? body.message : null))
      .catch(() => null);
    return text(message ?? "無法下載 demo", answer.status);
  }

  const headers = new Headers();
  for (const name of PASSED_ON) {
    const value = answer.headers.get(name);
    if (value) headers.set(name, value);
  }
  headers.set("Cache-Control", "private, no-store");
  return new Response(answer.body, { status: 200, headers });
}

function text(message: string, status: number): Response {
  return new Response(message, {
    status,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
