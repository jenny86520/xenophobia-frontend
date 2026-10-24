"use client";

import { useActionState } from "react";
import { updatePlayerNicknameAction } from "@/app/player/actions";
import { FormField, FormMessage, SubmitButton } from "@/components/member/form-controls";
import type { MemberActionState } from "@/types/member";

const EMPTY: MemberActionState = {};

/** The guest's nickname: chosen on the first Steam login (prefilled with the Steam name if known). */
export function PlayerNicknameForm({ nickname, firstTime }: { nickname: string; firstTime: boolean }) {
  const [state, action, pending] = useActionState(updatePlayerNicknameAction, EMPTY);
  return (
    <form action={action} className="flex max-w-md flex-col gap-4">
      <FormField
        id="player-nickname"
        name="nickname"
        label="暱稱"
        required
        maxLength={30}
        defaultValue={nickname}
        error={state.fields?.nickname}
        hint={firstTime ? "參加內戰時會顯示這個名稱，之後可以再修改。" : "參加內戰時顯示的名稱。"}
      />
      <FormMessage state={state} />
      <SubmitButton pending={pending} className="self-start">
        {firstTime ? "完成" : "儲存暱稱"}
      </SubmitButton>
    </form>
  );
}
