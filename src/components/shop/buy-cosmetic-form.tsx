"use client";

import { useActionState, useEffect, useRef } from "react";
import { ConfirmDialog } from "@/components/brand/confirm-dialog";
import { ctaPrimaryClasses } from "@/components/brand/cta-link";
import { FormMessage, SubmitButton } from "@/components/member/form-controls";
import { ShelfStatus } from "@/components/shop/product-card";
import { isPopoverOpen } from "@/lib/popover";
import type { CosmeticKind } from "@/types/cosmetic";
import type { MemberActionState } from "@/types/member";

/**
 * 購買 on a shop card (spec member-cosmetics, point-shop): the button opens a second confirmation
 * naming the price, and only 確認購買 there sends the purchase. It stays mounted when a purchase makes
 * a collectible 已擁有 (the action revalidates /shop, which re-renders the card with `owned`), so the
 * 「已購買「X」」 message survives the refresh instead of vanishing with the button. Works without
 * JavaScript (the dialog is a native popover); with it, the dialog closes once the answer arrives,
 * so the message under the card is in view.
 *
 * `buy` is `buyCosmeticAction` bound on the server (item id and price), like FriendActionButton's
 * action: binding the Server Action inside this client component made the no-JavaScript submission
 * hang while rendering its response in `next dev`.
 */
export function BuyCosmeticForm({
  buy,
  owned,
  itemId,
  name,
  price,
  kind,
}: {
  buy: (state: MemberActionState) => Promise<MemberActionState>;
  owned: boolean;
  itemId: string;
  name: string;
  price: number;
  kind: CosmeticKind;
}) {
  const [state, action, pending] = useActionState<MemberActionState>(buy, {});
  const dialogId = `buy-cosmetic-${itemId}`;
  const answered = useRef(state);
  useEffect(() => {
    if (answered.current === state) return;
    answered.current = state;
    const dialog = document.getElementById(dialogId);
    if (dialog && isPopoverOpen(dialog)) dialog.hidePopover();
  }, [state, dialogId]);

  if (owned) {
    return (
      <div className="flex flex-col items-start gap-2">
        <ShelfStatus kind="done">已擁有</ShelfStatus>
        <FormMessage state={state} />
      </div>
    );
  }
  return (
    <div className="flex flex-col items-stretch gap-2">
      <button
        type="button"
        popoverTarget={dialogId}
        className={ctaPrimaryClasses(
          "default",
          "w-full cursor-pointer justify-center",
        )}
      >
        購買
      </button>
      <ConfirmDialog
        id={dialogId}
        title="確認購買"
        confirm={
          <form action={action}>
            <SubmitButton pending={pending} className="px-4 py-2">
              確認購買
            </SubmitButton>
          </form>
        }
      >
        <p className="text-ink">
          要用 {price} 點購買「{name}」嗎？
        </p>
        <p>
          購買後不能退點。
          {kind === "cup"
            ? "每個冰炫風杯只能換到一支冰炫風上。"
            : "買到的外觀永久保留。"}
        </p>
      </ConfirmDialog>
      <FormMessage state={state} />
    </div>
  );
}
