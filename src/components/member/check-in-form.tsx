"use client";

import { CalendarCheck } from "lucide-react";
import { useActionState } from "react";
import { checkInAction } from "@/app/member/actions";
import type { MemberActionState } from "@/types/member";
import { FormMessage, SubmitButton } from "./form-controls";

const EMPTY: MemberActionState = {};

/**
 * Today's check-in. A plain form bound to a Server Action, so it works without JavaScript. Once the
 * member has checked in the button gives way to 「今天已簽到」, and the form stays mounted so the
 * success message (with any streak bonus) stays shown after the page refreshes.
 */
export function CheckInForm({ checkedInToday }: { checkedInToday: boolean }) {
  const [state, action, pending] = useActionState(checkInAction, EMPTY);
  return (
    <form action={action} className="flex flex-col gap-4">
      {checkedInToday ? (
        <p className="inline-flex items-center gap-2 text-lead text-ink">
          <CalendarCheck aria-hidden="true" className="size-5 shrink-0 text-signal" />
          今天已簽到
        </p>
      ) : (
        <SubmitButton pending={pending} className="self-start">
          <CalendarCheck aria-hidden="true" className="size-5 shrink-0" />
          簽到
        </SubmitButton>
      )}
      <FormMessage state={state} />
    </form>
  );
}
