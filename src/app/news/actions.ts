"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { memberFetch } from "@/lib/member-session";

/** Records that the member saw these messages; best effort (a failure just leaves them unread). */
async function markRead(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  try {
    await memberFetch("/api/member/news/read", { method: "POST", body: JSON.stringify({ ids }) });
  } catch {
    // Unreachable backend: the reminder simply shows again next time.
  }
}

/**
 * The reminder popup's form: 「知道了」 or one message's 「看全文」 (which sends `next`). Either way
 * every message in the popup counts as seen, the layout re-renders without it, and 看全文 then goes
 * to that message. Works without JavaScript; the modal island calls it on Esc too.
 */
export async function acknowledgeNewsAction(formData: FormData): Promise<void> {
  const ids = formData.getAll("ids").filter((id): id is string => typeof id === "string");
  await markRead(ids);
  revalidatePath("/", "layout");
  const next = formData.get("next");
  // Only our own message pages: never redirect to an address taken from the form as is.
  if (typeof next === "string" && /^\/news\/[\w-]+$/.test(next)) redirect(next);
}

/**
 * The member has these messages on screen (/news or a message's page): called by MarkNewsSeen
 * after mount. The layout is revalidated so the header's unread count drops at once: client
 * navigation never re-fetches the root layout, so without it the count stayed until a full reload.
 * MarkNewsSeen stays mounted through the refresh, so this runs once per page.
 */
export async function markNewsReadAction(ids: string[]): Promise<void> {
  await markRead(ids.slice(0, 50));
  revalidatePath("/", "layout");
}
