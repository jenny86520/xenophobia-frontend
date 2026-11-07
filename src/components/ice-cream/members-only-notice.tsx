import { CtaLink } from "@/components/brand/cta-link";
import { PageHeader } from "@/components/brand/page-header";
import { Section } from "@/components/brand/section";

/** What a visitor sees on the growth record pages: nothing from the record itself. */
export function IceCreamMembersOnly() {
  return (
    <main id="main">
      <Section spacing="tight" labelledBy="page-title">
        <PageHeader
          eyebrow="ICE CREAM / MEMBERS"
          title="冰炫風成長史冊"
          description="登入會員後即可查看。"
          actions={<CtaLink href="/member/login" label="會員登入" />}
        />
      </Section>
    </main>
  );
}
