import type { Metadata } from "next";
import { PageHeader } from "@/components/brand/page-header";
import { Section } from "@/components/brand/section";
import { TextLink } from "@/components/brand/text-link";
import { RegisterForm } from "@/components/member/member-forms";

export const metadata: Metadata = {
  title: "Member Sign-up",
  description: "註冊 XenoPhobiA 會員，管理員開通後即可登入並報名活動。",
};

export default function MemberRegisterPage() {
  return (
    <main id="main">
      <Section spacing="tight" labelledBy="page-title">
        <PageHeader
          eyebrow="MEMBER / SIGN-UP"
          title="註冊會員"
          description="註冊後需聯絡管理員開通。開通後會寄送設定密碼的信到你的 email，設定密碼後就能登入。"
        />
      </Section>
      <Section labelledBy="register-form-title" ruled>
        <h2 id="register-form-title" className="sr-only">
          註冊表單
        </h2>
        <RegisterForm />
        <p className="mt-8 text-body text-ink-secondary">
          已經是會員？
          <TextLink href="/member/login">前往登入</TextLink>
        </p>
      </Section>
    </main>
  );
}
