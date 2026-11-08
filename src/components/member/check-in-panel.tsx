"use client";

import { CalendarCheck } from "lucide-react";
import { type ReactNode, useActionState, useEffect, useRef } from "react";
import { checkInAction } from "@/app/member/actions";
import type { MemberActionState } from "@/types/member";
import { FormMessage, SubmitButton } from "./form-controls";

const EMPTY: MemberActionState = {};

type CheckInPanelProps = {
  checkedInToday: boolean;
  /** The balance, shown on the same row as the button. */
  balance: ReactNode;
  /** The running campaign (title, rules and StampCard); absent without one. */
  campaign?: ReactNode;
};

/**
 * Today's check-in: a plain form bound to a Server Action, so it works without JavaScript. Once the
 * member has checked in the button gives way to 「今天已簽到」, and the form stays mounted so the
 * success message (with any streak bonus) stays shown after the page refreshes.
 *
 * It also drives the stamp animation (spec 品牌特效：蓋章): `data-stamp-armed` once JavaScript runs,
 * `data-just-checked-in` after a successful check-in in this mount. Both are needed, so the stamp
 * plays only right after checking in, never on a reload or without JavaScript.
 */
export function CheckInPanel({ checkedInToday, balance, campaign }: CheckInPanelProps) {
  const [state, action, pending] = useActionState(checkInAction, EMPTY);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.dataset.stampArmed = "";
  }, []);

  return (
    <div ref={ref} data-just-checked-in={state.ok || undefined} className="flex flex-col gap-10">
      <form action={action} className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          {balance}
          {checkedInToday ? (
            <p className="inline-flex items-center gap-2 py-3 text-lead text-ink">
              <CalendarCheck aria-hidden="true" className="size-5 shrink-0 text-signal" />
              今天已簽到
            </p>
          ) : (
            <SubmitButton pending={pending}>
              <CalendarCheck aria-hidden="true" className="size-5 shrink-0" />
              簽到 +1
            </SubmitButton>
          )}
        </div>
        <FormMessage state={state} />
      </form>
      {campaign}
    </div>
  );
}
