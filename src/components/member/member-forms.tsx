"use client";

import { KeyRound } from "lucide-react";
import { Fragment, useActionState } from "react";
import {
  acceptLegalAction,
  loginAction,
  registerAction,
  requestResetAction,
  setPasswordAction,
  updateNicknameAction,
} from "@/app/member/actions";
import type { LegalConsentDocument, MemberActionState } from "@/types/member";
import { LegalDialogButton } from "@/components/legal/legal-dialog-button";
import { CheckboxField, FormField, FormMessage, SubmitButton } from "./form-controls";
import { PasswordField } from "./password-field";

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
      <FormField id="name" name="name" label="稱呼" autoComplete="off" required maxLength={50} defaultValue={value("name")} error={error("name")} hint="讓管理員辨識你，不必填真名。"/>
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
      <CheckboxField
        id="acceptTerms"
        name="acceptTerms"
        required
        defaultChecked={value("acceptTerms") === "on"}
        error={error("acceptTerms")}
      >
        我已閱讀並同意<LegalDialogButton kind="terms">使用條款</LegalDialogButton>與
        <LegalDialogButton kind="privacy">隱私權政策</LegalDialogButton>
      </CheckboxField>
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
      <PasswordField id="login-password" name="password" label="密碼" autoComplete="current-password" required />
      <FormMessage state={state} />
      <SubmitButton pending={pending} className="self-start">
        <KeyRound aria-hidden="true" className="size-4" />
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
      <PasswordField
        id="new-password"
        name="password"
        label="新密碼"
        autoComplete="new-password"
        required
        minLength={8}
        maxLength={128}
        hint="至少 8 個字元。"
        error={state.fields?.password}
      />
      <PasswordField
        id="new-password-confirm"
        name="passwordConfirm"
        label="再次輸入新密碼"
        autoComplete="new-password"
        required
        minLength={8}
        maxLength={128}
        error={state.fields?.passwordConfirm}
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

/**
 * Agrees to the renewed documents. The versions shown are sent along, so a version published in the
 * meantime is refused by the backend instead of being agreed to unread.
 */
export function LegalConsentForm({ documents }: { documents: LegalConsentDocument[] }) {
  const [state, action, pending] = useActionState(acceptLegalAction, EMPTY);
  const version = (key: string) => documents.find((document) => document.key === key)?.version ?? 0;
  const required = documents.filter((document) => document.required);
  return (
    <form action={action} className="flex max-w-xl flex-col gap-6">
      <input type="hidden" name="termsVersion" value={version("terms")} />
      <input type="hidden" name="privacyVersion" value={version("privacy")} />
      <CheckboxField id="acceptRenewedTerms" name="acceptRenewedTerms" required>
        我已閱讀並同意更新後的
        {required.map((document, index) => (
          <Fragment key={document.key}>
            {index > 0 && "與"}
            <LegalDialogButton kind={document.key}>{document.title}</LegalDialogButton>
          </Fragment>
        ))}
      </CheckboxField>
      <FormMessage state={state} />
      <SubmitButton pending={pending} className="self-start">
        同意並繼續
      </SubmitButton>
    </form>
  );
}
