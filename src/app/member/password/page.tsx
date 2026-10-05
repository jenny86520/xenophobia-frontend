import type { Metadata } from "next";
import { PageHeader } from "@/components/brand/page-header";
import { Section } from "@/components/brand/section";
import { TextLink } from "@/components/brand/text-link";
import { SetPasswordForm } from "@/components/member/member-forms";

export const metadata: Metadata = {
  title: "Set Password",
  description: "設定 XenoPhobiA 會員密碼。",
  // The page is reached from a one-time link; keep it and its token out of search engines.
  robots: { index: false, follow: false },
};

export default async function MemberPasswordPage({ searchParams }: PageProps<"/member/password">) {
  const { token } = await searchParams;
  const value = typeof token === "string" ? token : "";

  return (
    <main id="main">
      <Section spacing="tight" labelledBy="page-title">
        <PageHeader eyebrow="MEMBER / PASSWORD" title="設定密碼" />
      </Section>
      <Section labelledBy="password-form-title" ruled>
        <h2 id="password-form-title" className="sr-only">
          設定密碼表單
        </h2>
        {value ? (
          <SetPasswordForm token={value} />
        ) : (
          <p role="alert" className="text-body text-ink-secondary">
            連結已失效，請聯絡管理員重發。
          </p>
        )}
        <p className="mt-8 text-body text-ink-secondary">
          <TextLink href="/member/login">前往登入</TextLink>
        </p>
      </Section>
    </main>
  );
}
