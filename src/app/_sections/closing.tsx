import Image from "next/image";
import { CtaLink } from "@/components/brand/cta-link";
import { EditorialGrid } from "@/components/brand/editorial-grid";
import { Eyebrow } from "@/components/brand/eyebrow";
import { Placeholder } from "@/components/brand/placeholder";
import { Section } from "@/components/brand/section";
import { Heading } from "@/components/brand/typography";
import { ContactList } from "@/components/contact/contact-list";
import type { ContactInfo, TeamProfile } from "@/types/about";

type ClosingProps = {
  profile: TeamProfile;
  contacts: ContactInfo[];
};

/** 7 · Closing: how to reach the team, the site logo, and the CTAs. */
export function Closing({ profile, contacts }: ClosingProps) {
  return (
    <Section labelledBy="closing-title" ruled spacing="loose" className="reveal" id="closing">
      <EditorialGrid className="gap-y-12">
        <div className="col-span-4 flex flex-col gap-6 md:col-span-8 lg:col-span-9">
          <Eyebrow index={6}>Contact</Eyebrow>
          <Heading level={2} id="closing-title">
            聯絡我們
          </Heading>
          {contacts.length > 0 ? (
            <ContactList contacts={contacts} />
          ) : (
            <Placeholder name="contact.any" label="聯絡資訊" className="min-h-24" />
          )}
        </div>
        <div className="col-span-2 md:col-span-2 lg:col-span-2 lg:col-start-11 lg:row-start-1">
          <Image
            src="/brand/xpa-logo.png"
            alt={`${profile.name} LOGO`}
            width={256}
            height={256}
            sizes="(min-width: 1024px) 14vw, 40vw"
            className="h-auto w-full"
          />
        </div>
        <div className="col-span-4 flex flex-wrap items-center gap-x-8 gap-y-4 md:col-span-8 lg:col-span-9">
          {profile.primaryCtaLabel && profile.primaryCtaUrl ? (
            <CtaLink href={profile.primaryCtaUrl} label={profile.primaryCtaLabel} size="large" />
          ) : (
            <Placeholder name="brand.primary-cta" label="主要 CTA" inline />
          )}
          {profile.secondaryCtaLabel && profile.secondaryCtaUrl && (
            <CtaLink href={profile.secondaryCtaUrl} label={profile.secondaryCtaLabel} variant="secondary" />
          )}
        </div>
      </EditorialGrid>
    </Section>
  );
}
