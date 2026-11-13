"use client";

import Link from "next/link";
import { useActionState } from "react";
import { createIceCreamAction, deleteIceCreamAction, giftIceCreamAction } from "@/app/member/actions";
import { IceCreamIcon } from "@/components/brand/ice-cream-icon";
import type { CupStock } from "@/types/cosmetic";
import type { MemberActionState } from "@/types/member";
import { iceCreamName } from "@/utils/ice-cream-events";
import { secondaryButtonClasses } from "./friend-forms";
import { CheckboxField, FormMessage, SubmitButton } from "./form-controls";

/**
 * Forms of the 冰炫風 tab. Plain <form action> elements bound to Server Actions, so they work
 * without JavaScript; the backend decides every refusal and its wording.
 */

export function CreateIceCreamForm({ cost }: { cost: number }) {
  const [state, action, pending] = useActionState<MemberActionState>(createIceCreamAction, {});
  return (
    <form action={action} className="flex flex-col items-start gap-3">
      <SubmitButton pending={pending}>
        <IceCreamIcon />
        建立冰炫風（{cost} 點）
      </SubmitButton>
      <FormMessage state={state} />
    </form>
  );
}

/** Gives one held token to a friend picked from the member's own friend list. */
export function GiftIceCreamForm({
  id,
  serial,
  friends,
}: {
  id: string;
  serial: number;
  friends: { memberId: string; nickname: string }[];
}) {
  const [state, action, pending] = useActionState<MemberActionState, FormData>(giftIceCreamAction.bind(null, id), {});
  const selectId = `gift-${id}`;
  return (
    <form action={action} aria-label={`把${iceCreamName(serial)}送給好友`} className="flex flex-col gap-2">
      <div className="flex flex-wrap items-end gap-3">
        <label htmlFor={selectId} className="flex flex-col gap-1 text-caption text-ink-secondary">
          送給好友
          <select
            id={selectId}
            name="memberId"
            required
            defaultValue=""
            className="min-w-40 rounded-sm border border-line-strong bg-surface px-3 py-2 text-body text-ink focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <option value="" disabled>
              選擇好友
            </option>
            {friends.map((friend) => (
              <option key={friend.memberId} value={friend.memberId}>
                {friend.nickname}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" disabled={pending} className={secondaryButtonClasses}>
          {pending ? "處理中…" : "送出"}
        </button>
      </div>
      <FormMessage state={state} />
    </form>
  );
}

/** Deleting (inside its dialog) still needs its box ticked; the 3 points are not refunded. */
export function DeleteIceCreamForm({ id, serial }: { id: string; serial: number }) {
  const [state, action, pending] = useActionState<MemberActionState, FormData>(deleteIceCreamAction.bind(null, id), {});
  return (
    <form action={action} className="flex flex-col items-start gap-2">
      <CheckboxField id={`delete-ice-${id}`} name="confirm" required error={state.fields?.confirm}>
        確認刪除{iceCreamName(serial)}（點數不退）
      </CheckboxField>
      <button type="submit" disabled={pending} className={secondaryButtonClasses}>
        {pending ? "處理中…" : "確認刪除"}
      </button>
      <FormMessage state={state.fields?.confirm ? {} : state} />
    </form>
  );
}

/**
 * 換杯子 in a held token's detail dialog: one cup from the member's stock (each used up on change,
 * no way back to the default cup). With an empty stock it points to the shop instead. `change` is
 * `changeCupAction` bound to the token on the server (binding a Server Action in a client component
 * hung the no-JavaScript submission in `next dev`, see BuyCosmeticForm).
 */
export function ChangeCupForm({
  id,
  serial,
  stock,
  change,
}: {
  id: string;
  serial: number;
  stock: CupStock[];
  change: (state: MemberActionState, form: FormData) => Promise<MemberActionState>;
}) {
  const [state, action, pending] = useActionState<MemberActionState, FormData>(change, {});
  const selectId = `cup-${id}`;
  if (stock.length === 0) {
    // The stock can run out with the change just made: keep its message above the shop hint.
    return (
      <div className="flex flex-col gap-2">
        <FormMessage state={state} />
        <p className="text-caption text-ink-secondary">
        想換杯子？先到
        <Link href="/shop#shelf-cosmetics" className="underline underline-offset-4">
          點數商店
        </Link>
          買一個冰炫風杯，換一次用掉一個。
        </p>
      </div>
    );
  }
  return (
    <form action={action} aria-label={`替${iceCreamName(serial)}換杯子`} className="flex flex-col gap-2">
      <div className="flex flex-wrap items-end gap-3">
        <label htmlFor={selectId} className="flex flex-col gap-1 text-caption text-ink-secondary">
          換杯子（用掉一個，換不回預設杯）
          <select
            id={selectId}
            name="itemId"
            required
            defaultValue=""
            className="min-w-40 rounded-sm border border-line-strong bg-surface px-3 py-2 text-body text-ink focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <option value="" disabled>
              選擇杯子
            </option>
            {stock.map((entry) => (
              <option key={entry.item.id} value={entry.item.id}>
                {entry.item.name} × {entry.count}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" disabled={pending} className={secondaryButtonClasses}>
          {pending ? "處理中…" : "換上"}
        </button>
      </div>
      <FormMessage state={state} />
    </form>
  );
}
