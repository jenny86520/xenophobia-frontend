"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearPlayerToken, playerFetch } from "@/lib/player-session";
import type { MemberActionState } from "@/types/member";

/**
 * Server Actions for a guest player (signed in with Steam, no member account). Like the member
 * actions they only forward to the backend and hand back its message and field errors.
 */

type BackendError = { message?: string | string[]; fields?: Record<string, string> };

export async function updatePlayerNicknameAction(_: MemberActionState, form: FormData): Promise<MemberActionState> {
  let response: Response;
  try {
    response = await playerFetch("/api/player/me", {
      method: "PATCH",
      body: JSON.stringify({ nickname: String(form.get("nickname") ?? "") }),
    });
  } catch {
    return { ok: false, message: "目前無法連線，請稍後再試" };
  }
  if (response.status === 401) {
    // Disabled, deleted, or now linked to a member: this guest login is over.
    await clearPlayerToken();
    redirect("/player");
  }
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as BackendError;
    const message = Array.isArray(body.message) ? body.message.join("；") : body.message;
    return { ok: false, message: message || "儲存失敗，請稍後再試", fields: body.fields };
  }
  revalidatePath("/player");
  return { ok: true, message: "暱稱已更新。" };
}

export async function playerLogoutAction(): Promise<void> {
  await clearPlayerToken();
  redirect("/player");
}
