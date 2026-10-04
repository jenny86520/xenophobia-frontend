import { Container } from "@/components/brand/container";
import { Eyebrow } from "@/components/brand/eyebrow";
import { TextLink } from "@/components/brand/text-link";
import { Heading } from "@/components/brand/typography";

/** Rendered with HTTP 404 when the backend reports no such party. */
export default function PartyNotFound() {
  return (
    <main id="main" className="py-section-loose">
      <Container className="flex flex-col items-start gap-6">
        <Eyebrow>PARTY / 404</Eyebrow>
        <Heading level={1}>找不到活動</Heading>
        <p className="text-lead text-ink-secondary">Party not found.</p>
        <TextLink href="/party" lang="en" className="text-body text-ink">
          <span aria-hidden="true">←</span> Back to Party
        </TextLink>
      </Container>
    </main>
  );
}
