import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Eyebrow } from "@/components/brand/eyebrow";
import { PlainText } from "@/components/brand/plain-text";
import { Section } from "@/components/brand/section";
import { TextLink } from "@/components/brand/text-link";
import { Heading } from "@/components/brand/typography";
import { GuideMedia } from "@/components/guide/guide-media";
import { fetchGuide } from "@/lib/public-content-client";

export async function generateMetadata({ params }: PageProps<"/guide/[ref]">): Promise<Metadata> {
  const { ref } = await params;
  const guide = await fetchGuide(ref);
  return guide ? { title: guide.title } : { title: "找不到這篇手冊", robots: { index: false } };
}

/** One guide in full. Unknown and unpublished ones are a real 404. */
export default async function GuideItemPage({ params }: PageProps<"/guide/[ref]">) {
  const { ref } = await params;
  const guide = await fetchGuide(ref);
  if (!guide) notFound();

  return (
    <main id="main">
      <Section spacing="tight" labelledBy="page-title">
        <article className="flex max-w-[65ch] flex-col gap-6">
          <Eyebrow>GUIDE</Eyebrow>
          <Heading level={1} id="page-title">
            {guide.title}
          </Heading>
          <GuideMedia guide={guide} />
          <PlainText text={guide.content} headingLevel={2} />
          <TextLink href="/guide" className="self-start text-body">
            回到使用手冊
          </TextLink>
        </article>
      </Section>
    </main>
  );
}
