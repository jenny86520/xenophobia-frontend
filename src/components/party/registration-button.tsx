"use client";

import { useActionState } from "react";
import { registrationAction } from "@/app/member/actions";
import { FormMessage, SubmitButton } from "@/components/member/form-controls";
import type { MemberActionState } from "@/types/member";

type Props = {
  partyId: string;
  intent: "join" | "leave";
  /** Why the action is unavailable (shown next to the disabled button); null when allowed. */
  blockedReason: string | null;
};

/** 參加 / 取消參加: a form bound to the registration Server Action, so it works without JavaScript too. */
export function RegistrationButton({ partyId, intent, blockedReason }: Props) {
  const [state, action, pending] = useActionState<MemberActionState>(
    registrationAction.bind(null, partyId, intent),
    {},
  );
  const label = intent === "join" ? "參加" : "取消參加";
  return (
    <form action={action} className="flex flex-col items-start gap-3">
      {blockedReason ? (
        <>
          <button
            type="button"
            disabled
            aria-describedby="registration-blocked"
            className="rounded-sm border border-line px-5 py-3 text-body text-ink-muted"
          >
            {label}
          </button>
          <p id="registration-blocked" className="text-body text-ink-secondary">
            {blockedReason}
          </p>
        </>
      ) : (
        <SubmitButton pending={pending}>{label}</SubmitButton>
      )}
      <FormMessage state={state} />
    </form>
  );
}
