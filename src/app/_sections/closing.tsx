import { CtaLink } from "@/components/brand/cta-link";
import { EditorialGrid } from "@/components/brand/editorial-grid";
import { MediaFrame } from "@/components/brand/media-frame";
import { Placeholder } from "@/components/brand/placeholder";
import { Section } from "@/components/brand/section";
import type { TeamProfile } from "@/types/about";

/** 7 · Closing: a weighty last word and the primary CTA. */
export function Closing({ profile }: { profile: TeamProfile }) {
  return (
    <Section labelledBy="closing-title" ruled spacing="loose" className="reveal" id="closing">
      <EditorialGrid className="gap-y-12">
        <div className="col-span-4 md:col-span-8 lg:col-span-9">
          {profile.closingStatement ? (
            <h2 id="closing-title" className="font-heading text-h1 text-balance text-ink lg:text-[clamp(3rem,1rem+5vw,6rem)] lg:leading-[1.1]">
              {profile.closingStatement}
            </h2>
          ) : (
            <>
              <h2 id="closing-title" className="sr-only">
                結尾宣言
              </h2>
              <Placeholder name="brand.closing-statement" label="結尾宣言" className="min-h-40" />
            </>
          )}
        </div>
        <MediaFrame
          ratio="1/1"
          alt=""
          placeholderName="brand.vector-logo"
          placeholderLabel="向量 LOGO（SVG）"
          className="col-span-2 md:col-span-2 lg:col-span-2 lg:col-start-11 lg:row-start-1"
        />
        <div className="col-span-4 flex flex-wrap items-center gap-x-8 gap-y-4 md:col-span-6 lg:col-span-8">
          {profile.primaryCtaLabel && profile.primaryCtaUrl ? (
            <CtaLink href={profile.primaryCtaUrl} label={profile.primaryCtaLabel} size="large" />
          ) : (
            <Placeholder name="brand.primary-cta" label="主要 CTA" inline />
          )}
          {profile.secondaryCtaLabel && profile.secondaryCtaUrl && (
            <CtaLink href={profile.secondaryCtaUrl} label={profile.secondaryCtaLabel} variant="secondary" />
          )}
        </div>
        <a
          href="#main"
          className="link-underline col-span-4 justify-self-start font-mono text-meta text-ink-muted uppercase md:col-span-2 md:col-start-7 md:justify-self-end lg:col-start-12 lg:col-span-1"
        >
          ↑ Top
        </a>
      </EditorialGrid>
    </Section>
  );
}
