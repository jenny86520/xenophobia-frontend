import Link from "next/link";
import { BrandName } from "@/components/brand/brand-name";
import { Container } from "@/components/brand/container";
import { CtaLink } from "@/components/brand/cta-link";
import { EditorialGrid } from "@/components/brand/editorial-grid";
import { MediaFrame } from "@/components/brand/media-frame";
import { MetaLabel } from "@/components/brand/meta-label";
import { Placeholder } from "@/components/brand/placeholder";
import { Display } from "@/components/brand/typography";
import { Countdown } from "@/components/party/countdown";
import type { TeamProfile } from "@/types/about";
import type { NextParty } from "@/types/party";

type HeroProps = {
  profile: TeamProfile;
  nextParty: NextParty | null;
};

/** Twelve hairline column guides behind the hero (design §4, layer C). Decorative only. */
function ColumnGuides() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden lg:block">
      <Container className="h-full">
        <div className="grid h-full grid-cols-12 gap-x-6">
          {Array.from({ length: 12 }, (_, i) => (
            <div key={i} className="border-x border-line-subtle" />
          ))}
        </div>
      </Container>
    </div>
  );
}

/** 1 · Hero: who is this? Oversized wordmark, tagline, CTAs, the next party. */
export function Hero({ profile, nextParty }: HeroProps) {
  const mmdd = nextParty ? nextParty.startDate.slice(5).replace("-", "/") : null;

  return (
    <section aria-labelledby="hero-title" id="hero" className="relative overflow-clip py-section-loose">
      <ColumnGuides />
      <Container className="relative">
        <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-line pb-4">
          <MetaLabel>{profile.foundedYear ? `Est. ${profile.foundedYear}` : "Official Site"}</MetaLabel>
          {mmdd && <MetaLabel>Next / {mmdd}</MetaLabel>}
        </div>

        <Display as="h1" id="hero-title" className="hero-parallax mt-8 -mr-[6vw] break-words whitespace-nowrap max-md:whitespace-normal lg:text-[min(14.5vw,15rem)]">
          <BrandName name={profile.name} />
        </Display>

        <EditorialGrid className="mt-12 gap-y-10">
          <div className="col-span-4 flex flex-col gap-6 md:col-span-6 lg:col-span-7">
            {profile.tagline ? (
              <p className="font-heading text-h1 text-balance text-ink">{profile.tagline}</p>
            ) : (
              <Placeholder name="brand.tagline" label="品牌標語" className="min-h-32" />
            )}
            {profile.introduction && (
              <p className="max-w-[45ch] text-lead whitespace-pre-line text-ink-secondary">{profile.introduction}</p>
            )}
            <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
              {profile.primaryCtaLabel && profile.primaryCtaUrl ? (
                <CtaLink href={profile.primaryCtaUrl} label={profile.primaryCtaLabel} />
              ) : (
                <Placeholder name="brand.primary-cta" label="主要 CTA" inline />
              )}
              {profile.secondaryCtaLabel && profile.secondaryCtaUrl ? (
                <CtaLink href={profile.secondaryCtaUrl} label={profile.secondaryCtaLabel} variant="secondary" />
              ) : (
                <Placeholder name="brand.secondary-cta" label="次要 CTA" inline />
              )}
            </div>
          </div>

          {nextParty && (
            <div className="col-span-4 flex flex-col gap-3 self-end border-t border-line pt-4 md:col-span-6 lg:col-span-4 lg:col-start-9">
              <span className="inline-flex items-center gap-2">
                <span aria-hidden="true" className="size-2 rounded-full bg-signal shadow-glow motion-safe:animate-pulse" />
                <MetaLabel>Countdown</MetaLabel>
              </span>
              <Countdown
                startDate={nextParty.startDate}
                startTime={nextParty.startTime}
                className="font-mono text-h2 leading-none tracking-tight text-ink tabular-nums"
              />
              <Link
                href={`/party/${nextParty.id}`}
                className="link-underline self-start text-body text-ink-secondary hover:text-ink"
              >
                {nextParty.title} →
              </Link>
            </div>
          )}
        </EditorialGrid>

        <MediaFrame
          ratio="21/9"
          alt=""
          placeholderName="brand.key-visual"
          placeholderLabel="主視覺"
          className="mt-section-tight"
          sizes="100vw"
        />
      </Container>
    </section>
  );
}
