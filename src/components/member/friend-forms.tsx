"use client";

import { UserPlus } from "lucide-react";
import { useActionState } from "react";
import { removeFriendAction, sendFriendRequestAction } from "@/app/member/actions";
import { cn } from "@/lib/utils";
import type { MemberActionState } from "@/types/member";
import { CheckboxField, FormField, FormMessage, SubmitButton } from "./form-controls";

/**
 * Forms of the 好友 tab. Each is a <form action> bound to a Server Action, so all of them work
 * without JavaScript; the backend decides and words every refusal.
 */

export const secondaryButtonClasses = cn(
  "inline-flex items-center justify-center gap-2 rounded-sm border border-line-strong px-4 py-2 text-body text-ink",
  "hover:border-signal focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:opacity-60",
);

export function AddFriendForm() {
  const [state, action, pending] = useActionState<MemberActionState, FormData>(sendFriendRequestAction, {});
  return (
    // Keyed by the result, so a sent request clears the field and an error keeps what was typed.
    <form key={state.ok ? state.message : "form"} action={action} className="flex max-w-md flex-col gap-4">
      <FormField
        id="friend-member-number"
        name="memberNumber"
        label="朋友的會員編號"
        required
        maxLength={20}
        defaultValue={state.values?.memberNumber}
        error={state.fields?.memberNumber}
        hint="例如 XPA-0012。對方接受後就成為好友。"
      />
      <FormMessage state={state.fields?.memberNumber ? {} : state} />
      <SubmitButton pending={pending} className="self-start">
        <UserPlus aria-hidden="true" className="size-4" />
        送出好友邀請
      </SubmitButton>
    </form>
  );
}

type SimpleAction = (state: MemberActionState) => Promise<MemberActionState>;

/** One button running one bound action (accept, decline, withdraw, join, dismiss). */
export function FriendActionButton({
  action,
  label,
  primary,
}: {
  action: SimpleAction;
  label: string;
  primary?: boolean;
}) {
  const [state, formAction, pending] = useActionState<MemberActionState>(action, {});
  return (
    <form action={formAction} className="flex flex-col items-start gap-2">
      {primary ? (
        <SubmitButton pending={pending} className="px-4 py-2">
          {label}
        </SubmitButton>
      ) : (
        <button type="submit" disabled={pending} className={secondaryButtonClasses}>
          {pending ? "處理中…" : label}
        </button>
      )}
      <FormMessage state={state} />
    </form>
  );
}

/** Unfriending needs its box ticked first. */
export function RemoveFriendForm({ memberId, nickname }: { memberId: string; nickname: string }) {
  const [state, action, pending] = useActionState<MemberActionState, FormData>(
    removeFriendAction.bind(null, memberId),
    {},
  );
  return (
    <form action={action} className="flex flex-col items-start gap-3">
      <CheckboxField id={`remove-friend-${memberId}`} name="confirm" required error={state.fields?.confirm}>
        確認刪除好友「{nickname}」
      </CheckboxField>
      <button type="submit" disabled={pending} className={secondaryButtonClasses}>
        {pending ? "處理中…" : "刪除好友"}
      </button>
      <FormMessage state={state.fields?.confirm ? {} : state} />
    </form>
  );
}
