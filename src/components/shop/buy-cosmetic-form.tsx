"use client";

import { useActionState } from "react";
import { FormMessage, SubmitButton } from "@/components/member/form-controls";
import type { MemberActionState } from "@/types/member";

/**
 * 購買 on a shop card (spec member-cosmetics). It stays mounted when a purchase makes a collectible
 * 已擁有 (the action revalidates /shop, which re-renders the card with `owned`), so the 「已購買「X」」
 * message survives the refresh instead of vanishing with the button. Works without JavaScript.
 *
 * `buy` is `buyCosmeticAction` bound on the server (item id and price), like FriendActionButton's
 * action: binding the Server Action inside this client component made the no-JavaScript submission
 * hang while rendering its response in `next dev`.
 */
export function BuyCosmeticForm({
  buy,
  owned,
}: {
  buy: (state: MemberActionState) => Promise<MemberActionState>;
  owned: boolean;
}) {
  const [state, action, pending] = useActionState<MemberActionState>(buy, {});
  if (owned) {
    return (
      <div className="flex flex-col items-start gap-2">
        <span className="text-body text-ink-secondary">已擁有</span>
        <FormMessage state={state} />
      </div>
    );
  }
  return (
    <form action={action} className="flex flex-col items-start gap-2">
      <SubmitButton pending={pending} className="px-4 py-2">
        購買
      </SubmitButton>
      <FormMessage state={state} />
    </form>
  );
}
