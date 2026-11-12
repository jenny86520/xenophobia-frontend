"use client";

import { ArrowRight } from "lucide-react";
import { useActionState } from "react";
import { startSteamLinkAction } from "@/app/member/actions";
import { TextLink } from "@/components/brand/text-link";
import { FormMessage, SubmitButton } from "@/components/member/form-controls";
import { PasswordField } from "@/components/member/password-field";
import type { MemberActionState } from "@/types/member";
import { SteamIcon } from "./steam-icon";

const EMPTY: MemberActionState = {};

/**
 * Linking Steam starts with the member's password: the backend checks it (wrong ones count towards
 * the lock) and the action then goes to Steam. A plain form, so it works without JavaScript.
 */
export function SteamLinkForm() {
  const [state, action, pending] = useActionState(startSteamLinkAction, EMPTY);
  return (
    <form action={action} className="flex w-full max-w-md flex-col gap-4">
      <PasswordField
        id="steam-link-password"
        name="password"
        label="目前的密碼"
        required
        autoComplete="current-password"
        error={state.fields?.password}
        hint="為了確認是你本人，綁定前請再輸入一次密碼。連續錯誤三次會鎖定帳號。"
      />
      {!state.fields?.password && <FormMessage state={state} />}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <SubmitButton pending={pending}>
          <SteamIcon />
          綁定 Steam
          <ArrowRight aria-hidden="true" className="cta-arrow size-4" />
        </SubmitButton>
        <TextLink href="/member/login#reset-title">忘記密碼？</TextLink>
      </div>
    </form>
  );
}
