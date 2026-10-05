"use client";

import { useActionState } from "react";
import {
  loginAction,
  registerAction,
  requestResetAction,
  setPasswordAction,
  updateNicknameAction,
} from "@/app/member/actions";
import type { MemberActionState } from "@/types/member";
import { FormField, FormMessage, SubmitButton } from "./form-controls";

/**
 * Member forms. They are plain <form action={…}> elements bound to Server Actions, so they also
 * submit without JavaScript; with it, useActionState shows the backend's messages in place.
 */

const EMPTY: MemberActionState = {};

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, EMPTY);
  if (state.ok) return <FormMessage state={state} />;
  const value = (name: string) => state.values?.[name] ?? "";
  const error = (name: string) => state.fields?.[name];
  return (
    <form action={action} className="flex max-w-xl flex-col gap-6">
      <FormField id="name" name="name" label="姓名" autoComplete="name" required maxLength={50} defaultValue={value("name")} error={error("name")} hint="方便管理員辨識用。"/>
      <FormField id="nickname" name="nickname" label="暱稱" required maxLength={30} defaultValue={value("nickname")} error={error("nickname")} hint="在網站上將顯示這個名稱，後續可自行修改。" />
      <FormField
        id="username"
        name="username"
        label="帳號"
        autoComplete="username"
        required
        minLength={3}
        maxLength={30}
        defaultValue={value("username")}
        error={error("username")}
        hint="3 到 30 個英數字，可用 . _ -，登入時不分大小寫。"
      />
      <FormField id="discordId" name="discordId" label="Discord ID" required maxLength={50} defaultValue={value("discordId")} error={error("discordId")} hint="參加活動將以此帳號來識別。"/>
      <FormField id="email" name="email" label="Email" type="email" autoComplete="email" required defaultValue={value("email")} error={error("email")} hint="開通後，設定密碼的信會寄到這裡。" />
      <FormField id="phone" name="phone" label="手機" type="tel" autoComplete="tel" defaultValue={value("phone")} error={error("phone")} hint="方便管理員聯絡用。" />
      <FormMessage state={state} />
      <SubmitButton pending={pending} className="self-start">
        送出註冊
      </SubmitButton>
    </form>
  );
}

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, EMPTY);
  return (
    <form action={action} className="flex max-w-md flex-col gap-6">
      <FormField id="login-username" name="username" label="帳號" autoComplete="username" required defaultValue={state.values?.username ?? ""} />
      <FormField id="login-password" name="password" label="密碼" type="password" autoComplete="current-password" required />
      <FormMessage state={state} />
      <SubmitButton pending={pending} className="self-start">
        登入
      </SubmitButton>
    </form>
  );
}

export function ResetRequestForm() {
  const [state, action, pending] = useActionState(requestResetAction, EMPTY);
  return (
    <form action={action} className="flex max-w-md flex-col gap-6">
      <FormField id="reset-username" name="username" label="帳號" autoComplete="username" required />
      <FormMessage state={state} />
      <SubmitButton pending={pending} className="self-start">
        申請重設密碼
      </SubmitButton>
    </form>
  );
}

export function SetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(setPasswordAction, EMPTY);
  if (state.ok) return <FormMessage state={state} />;
  return (
    <form action={action} className="flex max-w-md flex-col gap-6">
      <input type="hidden" name="token" value={token} />
      <FormField
        id="new-password"
        name="password"
        label="新密碼"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        maxLength={128}
        hint="至少 8 個字元。"
        error={state.fields?.password}
      />
      <FormMessage state={state} />
      <SubmitButton pending={pending} className="self-start">
        設定密碼
      </SubmitButton>
    </form>
  );
}

export function NicknameForm({ nickname }: { nickname: string }) {
  const [state, action, pending] = useActionState(updateNicknameAction, EMPTY);
  return (
    <form action={action} className="flex max-w-md flex-col gap-4">
      <FormField
        id="nickname"
        name="nickname"
        label="暱稱"
        required
        maxLength={30}
        defaultValue={nickname}
        error={state.fields?.nickname}
        hint="暱稱是你唯一可以自己修改的資料；其他資料請聯絡管理員。"
      />
      <FormMessage state={state} />
      <SubmitButton pending={pending} className="self-start">
        儲存暱稱
      </SubmitButton>
    </form>
  );
}
