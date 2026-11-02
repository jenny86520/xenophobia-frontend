"use client";

import { useActionState } from "react";
import { registrationAction } from "@/app/member/actions";
import { FormMessage, SubmitButton } from "@/components/member/form-controls";
import { cn } from "@/lib/utils";
import type { MemberActionState } from "@/types/member";

type Props = {
  partyId: string;
  /** Set for a sub-party's button; null or left out for the party itself. */
  subPartyId?: string | null;
  intent: "join" | "leave";
  /** Why the action is unavailable (shown next to the disabled button); null when allowed. */
  blockedReason: string | null;
  /** "end" lines the button, a refusal and the reason up on the right (top-right of a block). */
  align?: "start" | "end";
};

/** 參加 / 取消參加: a form bound to the registration Server Action, so it works without JavaScript too. */
export function RegistrationButton({ partyId, subPartyId = null, intent, blockedReason, align = "start" }: Props) {
  const [state, action, pending] = useActionState<MemberActionState>(
    registrationAction.bind(null, partyId, intent, subPartyId),
    {},
  );
  const label = intent === "join" ? "參加" : "取消參加";
  // One page has a button per sub-party, so the reason's id must be unique.
  const blockedId = `registration-blocked-${subPartyId ?? "party"}`;
  return (
    <form action={action} className={cn("flex flex-col gap-3", align === "end" ? "items-end" : "items-start")}>
      {/* A refusal from the backend sits to the right of the button; success needs no text. */}
      <div
        className={cn(
          "flex flex-wrap items-center gap-x-4 gap-y-2",
          // A refusal stays beside the button; at the right edge it comes first so the button stays put.
          align === "end" && "flex-row-reverse",
        )}
      >
        {blockedReason ? (
          <button
            type="button"
            disabled
            aria-describedby={blockedId}
            className="rounded-sm border border-line px-5 py-3 text-body text-ink-muted"
          >
            {label}
          </button>
        ) : (
          <SubmitButton pending={pending}>{label}</SubmitButton>
        )}
        <FormMessage state={state} />
      </div>
      {blockedReason && (
        <p id={blockedId} className={cn("text-body text-ink-secondary", align === "end" && "text-right")}>
          {blockedReason}
        </p>
      )}
    </form>
  );
}
