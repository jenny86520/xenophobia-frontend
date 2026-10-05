"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearMemberToken, memberFetch, setMemberToken } from "@/lib/member-session";
import type { MemberActionState } from "@/types/member";

/**
 * Server Actions for the member pages. Each one only forwards the form to the backend and hands
 * back what the backend answered (its message and field errors); every rule lives in the backend.
 * Next.js only accepts these POSTs from the same origin.
 */

type BackendError = { message?: string | string[]; fields?: Record<string, string> };

async function errorState(response: Response, fallback: string): Promise<MemberActionState> {
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

export async function registerAction(_: MemberActionState, form: FormData): Promise<MemberActionState> {
  const body = Object.fromEntries(
    ["name", "nickname", "username", "discordId", "email", "phone"].map((field) => [field, text(form, field)]),
  );
  const response = await postPublic("/api/member/auth/register", body);
  if (!response) return { ...UNREACHABLE, values: body };
  if (!response.ok) return { ...(await errorState(response, "註冊失敗，請檢查欄位")), values: body };
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
  const response = await postPublic("/api/member/auth/password", {
    token: text(form, "token"),
    password: text(form, "password"),
  });
  if (!response) return UNREACHABLE;
  if (!response.ok) return errorState(response, "設定失敗，請稍後再試");
  return { ok: true, message: "密碼已設定，現在可以登入。" };
}

export async function updateNicknameAction(_: MemberActionState, form: FormData): Promise<MemberActionState> {
  let response: Response;
  try {
    response = await memberFetch("/api/member/me", {
      method: "PATCH",
      body: JSON.stringify({ nickname: text(form, "nickname") }),
    });
  } catch {
    return UNREACHABLE;
  }
  if (response.status === 401) return signInAgain();
  if (!response.ok) return errorState(response, "儲存失敗，請稍後再試");
  revalidatePath("/member");
  return { ok: true, message: "暱稱已更新。" };
}

/** Join or leave a party; the party id and intent are bound when the form is rendered. */
export async function registrationAction(
  partyId: string,
  intent: "join" | "leave",
): Promise<MemberActionState> {
  let response: Response;
  try {
    response = await memberFetch(`/api/member/parties/${encodeURIComponent(partyId)}/registration`, {
      method: intent === "join" ? "POST" : "DELETE",
    });
  } catch {
    return UNREACHABLE;
  }
  if (response.status === 401) return signInAgain();
  if (!response.ok) return errorState(response, "操作失敗，請稍後再試");
  revalidatePath(`/party/${partyId}`);
  revalidatePath("/member");
  return { ok: true, message: intent === "join" ? "已報名。" : "已取消報名。" };
}
