"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearMemberToken, memberFetch } from "@/lib/member-session";
import { actorFetch, playerActor, type PlayerActor } from "@/lib/player-actor";
import { clearPlayerToken } from "@/lib/player-session";
import type { MatchActionState } from "@/types/match";

/**
 * Server Actions for scrim matches. Like the member actions they only forward the form to the
 * backend and hand back its message and field errors; who may do what is decided there.
 * Sign-ups go as the member (if signed in) or the Steam guest; management only as the member.
 */

type BackendError = { message?: string | string[]; fields?: Record<string, string> };

async function errorState(response: Response, fallback: string): Promise<MatchActionState> {
  const body = (await response.json().catch(() => ({}))) as BackendError;
  const message = Array.isArray(body.message) ? body.message.join("；") : body.message;
  return { ok: false, message: message || fallback, fields: body.fields };
}

const UNREACHABLE: MatchActionState = { ok: false, message: "目前無法連線，請稍後再試" };

/** A refused form keeps what was typed and chosen (React resets the form after the action). */
function keepValues(result: MatchActionState, form: FormData): MatchActionState {
  if (result.ok) return result;
  const values = Object.fromEntries([...form.entries()].map(([name, value]) => [name, String(value)]));
  return { ...result, values };
}

const matchPath = (matchId: string) => `/api/matches/${encodeURIComponent(matchId)}`;

/** The token was refused: drop that cookie and send them to sign in again. */
async function signInAgain(actor: PlayerActor | null): Promise<never> {
  if (actor?.kind === "player") {
    await clearPlayerToken();
    redirect("/player");
  }
  await clearMemberToken();
  redirect("/member/login");
}

function refresh(matchId: string): void {
  revalidatePath(`/matches/${matchId}`);
  revalidatePath("/matches");
}

/** Sends one player request (sign-up, join, leave) as whoever is signed in. */
async function asPlayer(matchId: string, path: string, init: RequestInit, success: string): Promise<MatchActionState> {
  const actor = await playerActor();
  if (!actor) return { ok: false, message: "請先登入會員，或以 Steam 登入" };
  let response: Response;
  try {
    response = await actorFetch(`${matchPath(matchId)}${path}`, init, actor);
  } catch {
    return UNREACHABLE;
  }
  if (response.status === 401) return signInAgain(actor);
  if (!response.ok) return errorState(response, "操作失敗，請稍後再試");
  refresh(matchId);
  return { ok: true, message: success };
}

export async function signUpAction(matchId: string, mode: "solo" | "group"): Promise<MatchActionState> {
  return asPlayer(
    matchId,
    "/entries",
    { method: "POST", body: JSON.stringify({ mode }) },
    mode === "group" ? "小隊已建立，把邀請碼分享給隊友。" : "已報名。",
  );
}

export async function joinGroupAction(matchId: string, _: MatchActionState, form: FormData): Promise<MatchActionState> {
  const result = await asPlayer(
    matchId,
    "/entries/join",
    { method: "POST", body: JSON.stringify({ code: String(form.get("code") ?? "") }) },
    "已加入小隊。",
  );
  return keepValues(result, form);
}

export async function leaveAction(matchId: string): Promise<MatchActionState> {
  return asPlayer(matchId, "/entries/me", { method: "DELETE" }, "已退出報名。");
}

// ---- The creating member ----

/** Sends one management request as the signed-in member. */
async function asManager(
  matchId: string,
  path: string,
  init: RequestInit,
  success: (body: unknown) => string,
): Promise<MatchActionState> {
  let response: Response;
  try {
    response = await memberFetch(`${matchPath(matchId)}/manage${path}`, init);
  } catch {
    return UNREACHABLE;
  }
  if (response.status === 401) return signInAgain(null);
  if (!response.ok) return errorState(response, "操作失敗，請稍後再試");
  const body: unknown = await response.json().catch(() => null);
  refresh(matchId);
  return { ok: true, message: success(body) };
}

/** Unlocking, cancelling and removing need the "I am sure" box ticked (no dialog without JavaScript). */
const NOT_CONFIRMED: MatchActionState = { ok: false, message: "請先勾選確認再送出", fields: { confirm: "請勾選確認" } };
const confirmed = (form: FormData) => form.get("confirm") === "on";

export async function createMatchAction(_: MatchActionState, form: FormData): Promise<MatchActionState> {
  const partyId = String(form.get("partyId") ?? "");
  let response: Response;
  try {
    response = await memberFetch("/api/matches", {
      method: "POST",
      body: JSON.stringify({
        title: String(form.get("title") ?? ""),
        ...(partyId ? { partyId } : {}),
      }),
    });
  } catch {
    return keepValues(UNREACHABLE, form);
  }
  if (response.status === 401) return signInAgain(null);
  if (!response.ok) return keepValues(await errorState(response, "建立失敗，請稍後再試"), form);
  const created = (await response.json()) as { id: string };
  revalidatePath("/matches");
  redirect(`/matches/${created.id}`);
}

type Imported = { imported?: { added: number; skippedNoSteam: number; skippedFull: number } };

export async function importPartyAction(matchId: string): Promise<MatchActionState> {
  return asManager(matchId, "/import-party", { method: "POST" }, (body) => {
    const imported = (body as Imported | null)?.imported;
    if (!imported) return "已從派對帶入。";
    return `已帶入 ${imported.added} 人；未綁定 Steam 略過 ${imported.skippedNoSteam} 人，名額已滿略過 ${imported.skippedFull} 人。`;
  });
}

export async function lockAction(matchId: string): Promise<MatchActionState> {
  return asManager(matchId, "/lock", { method: "POST" }, () => "名單已鎖定。");
}

export async function generateTeamsAction(matchId: string): Promise<MatchActionState> {
  return asManager(matchId, "/teams/generate", { method: "POST" }, () => "已產生分隊候選。");
}

export async function unlockAction(matchId: string, _: MatchActionState, form: FormData): Promise<MatchActionState> {
  if (!confirmed(form)) return NOT_CONFIRMED;
  return asManager(matchId, "/unlock", { method: "POST" }, () => "已解除鎖定，回到報名中。");
}

export async function unconfirmTeamsAction(
  matchId: string,
  _: MatchActionState,
  form: FormData,
): Promise<MatchActionState> {
  if (!confirmed(form)) return NOT_CONFIRMED;
  return asManager(matchId, "/teams/unconfirm", { method: "POST" }, () => "已退回分隊，請重新選擇候選並確認。");
}

export async function cancelMatchAction(
  matchId: string,
  _: MatchActionState,
  form: FormData,
): Promise<MatchActionState> {
  if (!confirmed(form)) return NOT_CONFIRMED;
  return asManager(matchId, "/cancel", { method: "POST" }, () => "場次已取消。");
}

export async function removePlayerAction(
  matchId: string,
  _: MatchActionState,
  form: FormData,
): Promise<MatchActionState> {
  const playerId = String(form.get("playerId") ?? "");
  if (!playerId) return { ok: false, message: "請選擇要移出的玩家", fields: { playerId: "請選擇玩家" } };
  if (!confirmed(form)) return NOT_CONFIRMED;
  return asManager(matchId, `/players/${encodeURIComponent(playerId)}`, { method: "DELETE" }, () => "已移出名單。");
}

// ---- The map veto ----

/** The captain whose turn it is bans a map; `step` is the step their page showed. */
export async function captainBanAction(matchId: string, step: number, mapKey: string): Promise<MatchActionState> {
  return asPlayer(matchId, "/veto/bans", { method: "POST", body: JSON.stringify({ step, mapKey }) }, "已 Ban。");
}

export async function vetoStartAction(matchId: string, _: MatchActionState, form: FormData): Promise<MatchActionState> {
  const seconds = String(form.get("stepSeconds") ?? "").trim();
  const result = await asManager(
    matchId,
    "/veto/start",
    {
      method: "POST",
      body: JSON.stringify({
        rule: String(form.get("rule") ?? "random"),
        ...(seconds ? { stepSeconds: Number(seconds) } : {}),
      }),
    },
    () => "Ban 圖已開始。",
  );
  return keepValues(result, form);
}

/** A manager bans for the team whose turn it is: the chosen map, or (the 隨機 Ban button) a random one. */
export async function managerBanAction(
  matchId: string,
  step: number,
  _: MatchActionState,
  form: FormData,
): Promise<MatchActionState> {
  const random = form.get("intent") === "random";
  const mapKey = String(form.get("mapKey") ?? "");
  if (!random && !mapKey) return { ok: false, message: "請選擇要 Ban 的地圖", fields: { mapKey: "請選擇地圖" } };
  return asManager(
    matchId,
    "/veto/bans",
    { method: "POST", body: JSON.stringify(random ? { step, random: true } : { step, mapKey }) },
    () => (random ? "已隨機 Ban 一張。" : "已代為 Ban。"),
  );
}

export async function vetoUndoAction(matchId: string, _: MatchActionState, form: FormData): Promise<MatchActionState> {
  if (!confirmed(form)) return NOT_CONFIRMED;
  return asManager(matchId, "/veto/undo", { method: "POST" }, () => "已撤銷最近一步。");
}

export async function vetoResetAction(matchId: string, _: MatchActionState, form: FormData): Promise<MatchActionState> {
  if (!confirmed(form)) return NOT_CONFIRMED;
  return asManager(matchId, "/veto/reset", { method: "POST" }, () => "Ban 圖已重設。");
}

/** Each roster player posts `team-<playerId>` = A or B; the backend checks sizes, captains and groups. */
export async function confirmTeamsAction(
  matchId: string,
  _: MatchActionState,
  form: FormData,
): Promise<MatchActionState> {
  const teamA: string[] = [];
  const teamB: string[] = [];
  for (const [name, value] of form.entries()) {
    if (!name.startsWith("team-")) continue;
    const playerId = name.slice("team-".length);
    if (value === "A") teamA.push(playerId);
    if (value === "B") teamB.push(playerId);
  }
  const result = await asManager(
    matchId,
    "/teams/confirm",
    {
      method: "POST",
      body: JSON.stringify({
        teamA,
        teamB,
        captainA: String(form.get("captainA") ?? ""),
        captainB: String(form.get("captainB") ?? ""),
        allowSplit: form.get("allowSplit") === "on",
      }),
    },
    () => "隊伍已確認。",
  );
  return keepValues(result, form);
}
