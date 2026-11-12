import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Eyebrow } from "@/components/brand/eyebrow";
import { PlainText } from "@/components/brand/plain-text";
import { Section } from "@/components/brand/section";
import { TextLink } from "@/components/brand/text-link";
import { Heading } from "@/components/brand/typography";
import { MarkNewsSeen } from "@/components/news/mark-news-seen";
import { NewsCategoryBadge, NewsMeta } from "@/components/news/news-labels";
import { memberToken } from "@/lib/member-session";
import { fetchNews } from "@/lib/public-content-client";

export async function generateMetadata({ params }: PageProps<"/news/[id]">): Promise<Metadata> {
  const { id } = await params;
  const item = await fetchNews(id);
  if (!item) return { title: "找不到這則消息", robots: { index: false } };
  return {
    title: item.title,
    // Members-only messages stay out of search results.
    robots: item.visibility === "members" ? { index: false } : undefined,
  };
}

/** One message in full. Unknown, scheduled and (for visitors) members-only ones are a real 404. */
export default async function NewsItemPage({ params }: PageProps<"/news/[id]">) {
  const { id } = await params;
  const [item, signedIn] = await Promise.all([fetchNews(id), memberToken()]);
  if (!item) notFound();

  return (
    <main id="main">
      <Section spacing="tight" labelledBy="page-title">
        <TextLink href="/news" className="text-body text-ink-secondary hover:text-ink">
          <span aria-hidden="true">←</span> 最新消息
        </TextLink>
        <article className="mt-10 flex flex-col gap-6">
          <Eyebrow>NEWS</Eyebrow>
          <div className="flex flex-wrap items-center gap-3">
            <NewsCategoryBadge category={item.category} />
            <NewsMeta item={item} />
          </div>
          <Heading level={1} id="page-title">
            {item.title}
          </Heading>
          <PlainText text={item.content} headingLevel={2} />
        </article>
        {signedIn && <MarkNewsSeen ids={[item.id]} />}
      </Section>
    </main>
  );
}
