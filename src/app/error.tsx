"use client";

import { Container } from "@/components/brand/container";
import { Eyebrow } from "@/components/brand/eyebrow";
import { Heading } from "@/components/brand/typography";

/** Branded error boundary for any page whose server data failed to load. */
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="main" className="py-section-loose">
      <Container className="flex flex-col items-start gap-6">
        <Eyebrow>Error / Load failed</Eyebrow>
        <Heading level={1}>無法載入內容</Heading>
        <p className="max-w-[50ch] text-lead text-ink-secondary">伺服器暫時無法回應，請稍後再試。</p>
        <button
          type="button"
          onClick={reset}
          className="cta-primary inline-flex items-center rounded-sm bg-cta px-5 py-3 font-medium text-cta-ink focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          重新載入
        </button>
      </Container>
    </main>
  );
}
