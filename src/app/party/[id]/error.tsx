"use client";

import { Container } from "@/components/brand/container";
import { Eyebrow } from "@/components/brand/eyebrow";
import { TextLink } from "@/components/brand/text-link";
import { Heading } from "@/components/brand/typography";

/** The backend failed (5xx or unreachable) while loading this party. */
export default function PartyDetailError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="main" className="py-section-loose">
      <Container className="flex flex-col items-start gap-6">
        <Eyebrow>PARTY / ERROR</Eyebrow>
        <Heading level={1}>無法載入活動</Heading>
        <p role="alert" className="text-lead text-ink-secondary">
          Failed to load this party. Please try again later.
        </p>
        <div className="flex flex-wrap items-center gap-8">
          <button
            type="button"
            onClick={reset}
            className="cta-primary inline-flex items-center rounded-sm bg-cta px-5 py-3 font-medium text-cta-ink focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            重新載入
          </button>
          <TextLink href="/party" lang="en" className="text-body text-ink">
            <span aria-hidden="true">←</span> Back to Party
          </TextLink>
        </div>
      </Container>
    </main>
  );
}
