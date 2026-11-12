"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearMemberToken, memberFetch, setMemberToken } from "@/lib/member-session";
import type { IceCream } from "@/types/ice-cream";
import type { CheckInResult, MemberActionState } from "@/types/member";
import { iceCreamName } from "@/utils/ice-cream-events";
import { submissionGame } from "@/utils/video-upload";

/**
 * Server Actions for the member pages. Each one only forwards the form to the backend and hands
 * back what the backend answered (its message and field errors); every rule lives in the backend.
 * Next.js only accepts these POSTs from the same origin.
 */

type BackendError = { message?: string | string[]; fields?: Record<string, string> };

async function errorState(response: Response, fallback: string): Promise<MemberActionState> {
  // The member must first agree to renewed terms, which the member page asks for.
  if (response.status === 428) redirect("/member");
  const body = (await response.json().catch(() => ({}))) as BackendError;
  const message = Array.isArray(body.message) ? body.message.join("；") : body.message;
  return { ok: false, message: message || fallback, fields: body.fields };
}

const text = (form: FormData, name: string) => String(form.get(name) ?? "");

const UNREACHABLE: MemberActionState = { ok: false, message: "目前無法連線，請稍後再試" };

/** Posts JSON without a member token; null when the backend cannot be reached. */
async function postPublic(path: string, body: unknown): Promise<Response | null> {
  try {
    return await memberFetch(path, { method: "POST", body: JSON.stringify(body) }, null);
  } catch {
    return null;
  }
}

/** The session expired or the member was disabled: drop the cookie and go to the login page. */
async function signInAgain(): Promise<never> {
  await clearMemberToken();
  redirect("/member/login");
}

/** A ticked checkbox posts "on"; the backend gets true, or nothing (and refuses) when unticked. */
const ticked = (form: FormData, name: string) => (form.get(name) === "on" ? { [name]: true } : {});

export async function registerAction(_: MemberActionState, form: FormData): Promise<MemberActionState> {
  const fields = Object.fromEntries(
    ["name", "nickname", "username", "discordId", "email", "phone"].map((field) => [field, text(form, field)]),
  );
  // What was typed and ticked, so the form shows it again after an error.
  const values = { ...fields, acceptTerms: text(form, "acceptTerms") };
  const response = await postPublic("/api/member/auth/register", { ...fields, ...ticked(form, "acceptTerms") });
  if (!response) return { ...UNREACHABLE, values };
  if (!response.ok) return { ...(await errorState(response, "註冊失敗，請檢查欄位")), values };
  return { ok: true, message: "註冊完成，請聯絡管理員開通，開通後會寄送設定密碼的信到你的 email。" };
}

export async function loginAction(_: MemberActionState, form: FormData): Promise<MemberActionState> {
  const response = await postPublic("/api/member/auth/login", {
    username: text(form, "username"),
    password: text(form, "password"),
  });
  const values = { username: text(form, "username") };
  if (!response) return { ...UNREACHABLE, values };
  if (!response.ok) return { ...(await errorState(response, "帳號或密碼錯誤")), values };
  const { accessToken, expiresIn } = (await response.json()) as { accessToken: string; expiresIn: number };
  await setMemberToken(accessToken, expiresIn);
  redirect("/member");
}

export async function logoutAction(): Promise<void> {
  await clearMemberToken();
  redirect("/member/login");
}

export async function requestResetAction(_: MemberActionState, form: FormData): Promise<MemberActionState> {
  const response = await postPublic("/api/member/auth/reset-request", { username: text(form, "username") });
  if (!response) return UNREACHABLE;
  if (!response.ok) return errorState(response, "送出失敗，請稍後再試");
  const { message } = (await response.json()) as { message: string };
  return { ok: true, message };
}

export async function setPasswordAction(_: MemberActionState, form: FormData): Promise<MemberActionState> {
  // A typo would cost the one-time link and the day's change, so both entries must match first.
  if (text(form, "password") !== text(form, "passwordConfirm")) {
    return { ok: false, message: "兩次輸入的密碼不一致", fields: { passwordConfirm: "兩次輸入的密碼不一致" } };
  }
  const response = await postPublic("/api/member/auth/password", {
    token: text(form, "token"),
    password: text(form, "password"),
  });
  if (!response) return UNREACHABLE;
  if (!response.ok) return errorState(response, "設定失敗，請稍後再試");
  return { ok: true, message: "密碼已設定，現在可以登入。" };
}

/** The member's own 稱呼 and nickname; both are sent, and the backend records only what changed. */
export async function updateProfileAction(_: MemberActionState, form: FormData): Promise<MemberActionState> {
  const values = { name: text(form, "name"), nickname: text(form, "nickname") };
  let response: Response;
  try {
    response = await memberFetch("/api/member/me", { method: "PATCH", body: JSON.stringify(values) });
  } catch {
    return { ...UNREACHABLE, values };
  }
  if (response.status === 401) return signInAgain();
  if (!response.ok) return { ...(await errorState(response, "儲存失敗，請稍後再試")), values };
  revalidatePath("/member");
  return { ok: true, message: "個人資料已更新。" };
}

/** Today's check-in; the message names what the backend credited. */
export async function checkInAction(): Promise<MemberActionState> {
  let response: Response;
  try {
    response = await memberFetch("/api/member/check-ins", { method: "POST" });
  } catch {
    return UNREACHABLE;
  }
  if (response.status === 401) return signInAgain();
  if (!response.ok) return errorState(response, "簽到失敗，請稍後再試");
  const { awarded, campaign } = (await response.json()) as CheckInResult;
  revalidatePath("/member");
  const bonus =
    awarded.streakBonus > 0
      ? `連續簽到滿 ${campaign?.requiredDays ?? ""} 天，另外獲得 ${awarded.streakBonus} 點連續簽到獎勵。`
      : "";
  return { ok: true, message: `簽到成功，獲得 ${awarded.checkin} 點。${bonus}` };
}

/** Agrees to the documents at the versions the member was shown; the backend refuses stale ones. */
export async function acceptLegalAction(_: MemberActionState, form: FormData): Promise<MemberActionState> {
  let response: Response;
  try {
    response = await memberFetch("/api/member/legal-consent", {
      method: "POST",
      body: JSON.stringify({
        termsVersion: Number(text(form, "termsVersion")),
        privacyVersion: Number(text(form, "privacyVersion")),
      }),
    });
  } catch {
    return UNREACHABLE;
  }
  if (response.status === 401) return signInAgain();
  // Also after a refusal: a newer version was published, so the page and dialogs show it.
  revalidatePath("/", "layout");
  if (!response.ok) return errorState(response, "送出失敗，請重新整理後再試");
  redirect("/member");
}

/** Submits a YouTube link for review; an empty date is left out, so the backend uses today. */
export async function submitYoutubeVideoAction(_: MemberActionState, form: FormData): Promise<MemberActionState> {
  const values = Object.fromEntries(
    ["gameId", "otherGameName", "title", "recordedOn", "youtubeUrl", "rightsConfirmed"].map((field) => [
      field,
      text(form, field),
    ]),
  );
  const body = {
    ...submissionGame(values.gameId, values.otherGameName),
    title: values.title,
    youtubeUrl: values.youtubeUrl,
    ...(values.recordedOn ? { recordedOn: values.recordedOn } : {}),
    ...ticked(form, "rightsConfirmed"),
  };
  let response: Response;
  try {
    response = await memberFetch("/api/member/video-submissions", {
      method: "POST",
      body: JSON.stringify(body),
    });
  } catch {
    return { ...UNREACHABLE, values };
  }
  if (response.status === 401) return signInAgain();
  if (!response.ok) return { ...(await errorState(response, "投稿失敗，請檢查欄位")), values };
  revalidatePath("/member");
  return { ok: true, message: "已送出投稿，請等待管理員審核。" };
}

/**
 * Join or leave a party, or one of its sub-parties; the ids and intent are bound when the form is
 * rendered (subPartyId null for the party itself).
 */
export async function registrationAction(
  partyId: string,
  intent: "join" | "leave",
  subPartyId: string | null = null,
): Promise<MemberActionState> {
  const partyPath = `/api/member/parties/${encodeURIComponent(partyId)}`;
  const path = subPartyId
    ? `${partyPath}/sub-parties/${encodeURIComponent(subPartyId)}/registration`
    : `${partyPath}/registration`;
  let response: Response;
  try {
    response = await memberFetch(path, { method: intent === "join" ? "POST" : "DELETE" });
  } catch {
    return UNREACHABLE;
  }
  if (response.status === 401) return signInAgain();
  if (!response.ok) return errorState(response, "操作失敗，請稍後再試");
  revalidatePath(`/party/${partyId}`);
  revalidatePath("/member");
  // No success text: the refreshed page already shows the new state (and the other button).
  return { ok: true };
}

// ---- Friends ----

/** Friends and invites change the header count too, so the whole layout is refreshed. */
function refreshFriends(): void {
  revalidatePath("/", "layout");
}

/**
 * Sends one member request for the 好友 tab: the backend's response, or the state to show when
 * it could not be reached. A refused token signs the member in again.
 */
async function friendRequest(
  path: string,
  init: RequestInit,
): Promise<{ response: Response } | { state: MemberActionState }> {
  let response: Response;
  try {
    response = await memberFetch(path, init);
  } catch {
    return { state: UNREACHABLE };
  }
  if (response.status === 401) return signInAgain();
  return { response };
}

export async function sendFriendRequestAction(_: MemberActionState, form: FormData): Promise<MemberActionState> {
  const values = { memberNumber: text(form, "memberNumber") };
  const sent = await friendRequest("/api/member/friends/requests", {
    method: "POST",
    body: JSON.stringify(values),
  });
  if ("state" in sent) return { ...sent.state, values };
  const { response } = sent;
  if (!response.ok) return { ...(await errorState(response, "送出失敗，請稍後再試")), values };
  const result = (await response.json()) as { status: "pending" | "accepted"; member: { nickname: string } };
  refreshFriends();
  return {
    ok: true,
    message:
      result.status === "accepted"
        ? `「${result.member.nickname}」也邀請過你，你們已經是好友了。`
        : `已送出好友邀請給「${result.member.nickname}」。`,
  };
}

/** Saves the member's private note about a friend (empty removes it); the friend id is bound. */
export async function updateFriendNoteAction(
  memberId: string,
  _: MemberActionState,
  form: FormData,
): Promise<MemberActionState> {
  const values = { note: text(form, "note") };
  const sent = await friendRequest(`/api/member/friends/${encodeURIComponent(memberId)}/note`, {
    method: "PUT",
    body: JSON.stringify(values),
  });
  if ("state" in sent) return { ...sent.state, values };
  const { response } = sent;
  if (!response.ok) return { ...(await errorState(response, "儲存失敗，請稍後再試")), values };
  const { note } = (await response.json()) as { note: string | null };
  revalidatePath("/member");
  revalidatePath(`/member/friends/${memberId}`);
  return { ok: true, message: note ? "已儲存備註。" : "已清除備註。" };
}

/** Accept or decline a request sent to the member, or withdraw one they sent. */
export async function answerFriendRequestAction(
  requestId: string,
  intent: "accept" | "decline" | "withdraw",
): Promise<MemberActionState> {
  const path = `/api/member/friends/requests/${encodeURIComponent(requestId)}`;
  const sent = await friendRequest(intent === "accept" ? `${path}/accept` : path, {
    method: intent === "accept" ? "POST" : "DELETE",
  });
  if ("state" in sent) return sent.state;
  const { response } = sent;
  if (!response.ok) return errorState(response, "操作失敗，請重新整理後再試");
  refreshFriends();
  const done = { accept: "已成為好友。", decline: "已拒絕邀請。", withdraw: "已收回邀請。" };
  return { ok: true, message: done[intent] };
}

/** Unfriends after the box is ticked (no confirmation dialog without JavaScript). */
export async function removeFriendAction(
  memberId: string,
  _: MemberActionState,
  form: FormData,
): Promise<MemberActionState> {
  if (form.get("confirm") !== "on") {
    return { ok: false, message: "請先勾選確認", fields: { confirm: "請先勾選確認" } };
  }
  const sent = await friendRequest(`/api/member/friends/${encodeURIComponent(memberId)}`, {
    method: "DELETE",
  });
  if ("state" in sent) return sent.state;
  const { response } = sent;
  if (!response.ok) return errorState(response, "刪除失敗，請重新整理後再試");
  refreshFriends();
  return { ok: true, message: "已刪除好友。" };
}

/** Joins the inviter's group and opens the match. */
export async function acceptMatchInviteAction(inviteId: string): Promise<MemberActionState> {
  const sent = await friendRequest(`/api/member/match-invites/${encodeURIComponent(inviteId)}/accept`, {
    method: "POST",
  });
  if ("state" in sent) return sent.state;
  const { response } = sent;
  if (!response.ok) return errorState(response, "加入失敗，請重新整理後再試");
  const { matchId } = (await response.json()) as { matchId: string };
  refreshFriends();
  revalidatePath(`/matches/${matchId}`);
  redirect(`/matches/${matchId}`);
}

export async function dismissMatchInviteAction(inviteId: string): Promise<MemberActionState> {
  const sent = await friendRequest(`/api/member/match-invites/${encodeURIComponent(inviteId)}`, {
    method: "DELETE",
  });
  if ("state" in sent) return sent.state;
  const { response } = sent;
  if (!response.ok) return errorState(response, "操作失敗，請重新整理後再試");
  refreshFriends();
  return { ok: true, message: "已略過這個邀請。" };
}

// ---- Ice cream tokens ----

/** Gifts and redemption requests change the header count, so the whole layout is refreshed. */
async function iceCreamRequest(
  path: string,
  init: RequestInit,
  fallback: string,
): Promise<MemberActionState | IceCream> {
  const sent = await friendRequest(path, init);
  if ("state" in sent) return sent.state;
  if (!sent.response.ok) return errorState(sent.response, fallback);
  // Acting on the tab means it was seen, which also covers browsers without JavaScript.
  await markIceCreamsSeenAction();
  refreshFriends();
  return (await sent.response.json()) as IceCream;
}

const isState = (result: MemberActionState | IceCream): result is MemberActionState => !("serial" in result);

/**
 * The member has the 冰炫風 tab on screen: tokens the admins gave them stop counting as new. Called
 * by MarkIceCreamsSeen after mount, best effort (a failure just leaves the count for next time).
 * Nothing is revalidated, so the 「新」 marks stay on this screen; the counts drop on the next page.
 */
export async function markIceCreamsSeenAction(): Promise<void> {
  try {
    await memberFetch("/api/member/ice-creams/seen", { method: "POST" });
  } catch {
    // Unreachable backend: try again the next time the tab opens.
  }
}

/** Issues a token for 3 points. */
export async function createIceCreamAction(): Promise<MemberActionState> {
  const result = await iceCreamRequest("/api/member/ice-creams", { method: "POST" }, "建立失敗，請稍後再試");
  if (isState(result)) return result;
  return { ok: true, message: `已建立${iceCreamName(result.serial)}，可以送給好友了。` };
}

/** Gives a held token to the friend chosen in the form; the token id is bound. */
export async function giftIceCreamAction(id: string, _: MemberActionState, form: FormData): Promise<MemberActionState> {
  const result = await iceCreamRequest(
    `/api/member/ice-creams/${encodeURIComponent(id)}/gift`,
    { method: "POST", body: JSON.stringify({ memberId: text(form, "memberId") }) },
    "送出失敗，請稍後再試",
  );
  if (isState(result)) return result;
  return { ok: true, message: `已送給「${result.giftTo?.nickname ?? ""}」，等對方接收（24 小時內）。` };
}

const ICE_STEPS: Record<
  "accept" | "decline" | "requestRedeem" | "cancelRedeem" | "confirmPhysical" | "disputePhysical",
  { path: string; method: "POST" | "DELETE"; done: (ice: IceCream) => string }
> = {
  accept: { path: "accept", method: "POST", done: () => "已收下這支冰炫風。" },
  decline: { path: "decline", method: "POST", done: () => "已退回。" },
  requestRedeem: { path: "redeem-request", method: "POST", done: () => "已申請兌換，等發行人處理。" },
  cancelRedeem: { path: "redeem-request", method: "DELETE", done: () => "已撤回兌換申請。" },
  confirmPhysical: {
    path: "confirm",
    method: "POST",
    done: (ice) => `吃到了！${iceCreamName(ice.serial)}功成身退。`,
  },
  disputePhysical: { path: "dispute", method: "POST", done: () => "已退回兌換中，等對方重新請客。" },
};

/**
 * Accept, decline, ask to redeem or withdraw that request, or (the holder) confirm or dispute a
 * physical redemption; token id and step are bound.
 */
export async function iceCreamStepAction(id: string, step: keyof typeof ICE_STEPS): Promise<MemberActionState> {
  const { path, method, done } = ICE_STEPS[step];
  const result = await iceCreamRequest(
    `/api/member/ice-creams/${encodeURIComponent(id)}/${path}`,
    { method },
    "操作失敗，請重新整理後再試",
  );
  return isState(result) ? result : { ok: true, message: done(result) };
}

/** The issuer completes a redemption: 3 points to the holder, or a physical McFlurry. */
export async function redeemIceCreamAction(id: string, method: "points" | "physical"): Promise<MemberActionState> {
  const result = await iceCreamRequest(
    `/api/member/ice-creams/${encodeURIComponent(id)}/redeem`,
    { method: "POST", body: JSON.stringify({ method }) },
    "兌換失敗，請稍後再試",
  );
  if (isState(result)) return result;
  return {
    ok: true,
    message:
      method === "points"
        ? `已給 3 點，${iceCreamName(result.serial)}功成身退。`
        : `已請客，等「${result.holder?.nickname ?? ""}」驗收。`,
  };
}

/** The issuer deletes a token they hold, once the box is ticked (no refund). */
export async function deleteIceCreamAction(
  id: string,
  _: MemberActionState,
  form: FormData,
): Promise<MemberActionState> {
  if (form.get("confirm") !== "on") {
    return { ok: false, message: "請先勾選確認", fields: { confirm: "請先勾選確認" } };
  }
  const result = await iceCreamRequest(
    `/api/member/ice-creams/${encodeURIComponent(id)}`,
    { method: "DELETE" },
    "刪除失敗，請稍後再試",
  );
  return isState(result) ? result : { ok: true, message: `已刪除${iceCreamName(result.serial)}。` };
}

/** Claims the free token of a limited period in the point shop; the period id is bound. */
export async function claimIceCampaignAction(campaignId: string): Promise<MemberActionState> {
  const result = await iceCreamRequest(
    `/api/member/ice-campaigns/${encodeURIComponent(campaignId)}/claim`,
    { method: "POST" },
    "兌換失敗，請稍後再試",
  );
  if (isState(result)) return result;
  revalidatePath("/shop");
  return { ok: true, message: `已兌換${iceCreamName(result.serial)}，在會員頁的冰炫風分頁可以看到。` };
}
