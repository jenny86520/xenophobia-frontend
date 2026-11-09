import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { EditorialGrid } from "@/components/brand/editorial-grid";
import { Eyebrow } from "@/components/brand/eyebrow";
import { Section } from "@/components/brand/section";
import { TextLink } from "@/components/brand/text-link";
import { Heading } from "@/components/brand/typography";
import { NewsMeta } from "@/components/news/news-labels";
import type { NewsItem } from "@/types/news";

/** Where「All news」goes: /news opened on the 最新消息 category. */
export const HOME_NEWS_HREF = "/news?category=news";

/**
 * 5 · News (in place of the milestones, which stay on /about): the newest 最新消息 from the backend as
 * hairline rows of date and title, each a link to the message. Never marks them read.
 */
export function News({ items, index }: { items: NewsItem[]; index: number }) {
  return (
    <Section labelledBy="news-title" ruled className="reveal" id="news">
      <EditorialGrid className="gap-y-8">
        <div className="col-span-4 flex flex-col gap-4 md:col-span-8 lg:sticky lg:top-8 lg:col-span-4 lg:self-start">
          <Eyebrow index={index}>News</Eyebrow>
          <Heading level={2} id="news-title">
            最新消息
          </Heading>
          <TextLink href={HOME_NEWS_HREF} lang="en" className="cta-secondary self-start text-body text-ink">
            All news <span aria-hidden="true">→</span>
          </TextLink>
        </div>
        <div className="col-span-4 md:col-span-8 lg:col-span-8 lg:col-start-5">
          {items.length > 0 ? (
            <ul aria-label="最新消息" className="border-t border-line">
              {items.map((item) => (
                <li key={item.id} className="list-row relative isolate overflow-hidden border-b border-line">
                  <Link
                    href={`/news/${item.id}`}
                    className="flex items-start gap-4 px-2 py-6 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none md:gap-8"
                  >
                    <span className="w-28 shrink-0 pt-1">
                      <NewsMeta item={item} />
                    </span>
                    <h3 className="min-w-0 flex-1 font-heading text-h3 text-ink">{item.title}</h3>
                    <ArrowRight aria-hidden="true" className="list-row-arrow mt-1 hidden size-5 shrink-0 text-ink-muted md:block" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="border-t border-b border-line py-6 text-body text-ink-secondary">目前還沒有消息。</p>
          )}
        </div>
      </EditorialGrid>
    </Section>
  );
}
