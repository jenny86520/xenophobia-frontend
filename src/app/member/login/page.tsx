import type { Metadata } from "next";
import { EditorialGrid } from "@/components/brand/editorial-grid";
import { PageHeader } from "@/components/brand/page-header";
import { Section } from "@/components/brand/section";
import { TextLink } from "@/components/brand/text-link";
import { Heading } from "@/components/brand/typography";
import { LoginForm, ResetRequestForm } from "@/components/member/member-forms";

export const metadata: Metadata = {
  title: "Member Login",
  description: "XenoPhobiA 會員登入。",
};

export default function MemberLoginPage() {
  return (
    <main id="main">
      <Section spacing="tight" labelledBy="page-title">
        <PageHeader eyebrow="MEMBER / LOGIN" title="會員登入" />
      </Section>
      <Section labelledBy="login-title" ruled>
        <EditorialGrid className="gap-y-12">
          <div className="col-span-4 flex flex-col gap-6 md:col-span-8 lg:col-span-6">
            <Heading level={2} id="login-title">
              登入
            </Heading>
            <p
              role="note"
              className="border-l-2 border-signal pl-3 text-body text-ink-secondary"
            >
              密碼連續輸入錯誤三次，帳號會被鎖定，需聯絡管理員解鎖。
            </p>
            <LoginForm />
            <p className="text-body text-ink-secondary">
              還不是會員？
              <TextLink href="/member/register">註冊會員</TextLink>
            </p>
          </div>
          <div className="col-span-4 flex flex-col gap-6 md:col-span-8 lg:col-span-5 lg:col-start-8">
            <Heading level={2} id="reset-title">
              忘記密碼或要變更密碼
            </Heading>
            <p className="text-body text-ink-secondary">
              輸入帳號送出申請，管理員處理後會寄送設定密碼的信。
              <br />
              每個帳號一天只能申請一次，密碼一天只能變更一次。
            </p>
            <ResetRequestForm />
          </div>
        </EditorialGrid>
      </Section>
    </main>
  );
}
