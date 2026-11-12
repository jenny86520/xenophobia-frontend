import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCheck } from "lucide-react";
import { MetaLabel } from "@/components/brand/meta-label";
import { PageHeader } from "@/components/brand/page-header";
import { Section } from "@/components/brand/section";
import { TextLink } from "@/components/brand/text-link";
import { NEWS_CATEGORY_LABELS, NewsCategoryBadge, NewsMeta, NewsUnreadBadge } from "@/components/news/news-labels";
import { Button } from "@/components/ui/button";
import { markAllNewsReadAction } from "@/app/news/actions";
import { fetchMemberNewsSummary } from "@/lib/member-session";
import { fetchNewsList } from "@/lib/public-content-client";
import type { NewsCategory } from "@/types/news";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "News",
  description: "XenoPhobiA 最新消息與網站更新紀錄。",
};

const TABS: { category: NewsCategory | null; label: string }[] = [
  { category: null, label: "全部" },
  { category: "news", label: NEWS_CATEGORY_LABELS.news },
  { category: "update", label: NEWS_CATEGORY_LABELS.update },
];

function pageHref(category: NewsCategory | null, page: number): string {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/news?${query}` : "/news";
}

/**
 * 最新消息 and 網站更新, newest first. The category tabs and pages are links (state in the URL), so
 * they work without JavaScript. A signed-in member sees NEW on what they have not opened (the
 * backend decides); listing never marks anything read, opening a message or 全部標記已讀 does.
 */
export default async function NewsPage({ searchParams }: PageProps<"/news">) {
  const query = await searchParams;
  const category = query.category === "news" || query.category === "update" ? query.category : null;
  const page = typeof query.page === "string" && /^[1-9]\d*$/.test(query.page) ? Number(query.page) : 1;
  // The layout already fetched the summary in this request (React.cache); 0 when signed out.
  const [list, summary] = await Promise.all([fetchNewsList(category, page), fetchMemberNewsSummary()]);
  const pages = Math.max(1, Math.ceil(list.total / list.pageSize));

  return (
    <main id="main">
      <Section spacing="tight" labelledBy="page-title">
        <PageHeader
          eyebrow="NEWS / UPDATES"
          title="最新消息"
          description="新功能、活動公告，以及網站每一次的更新紀錄。"
        />
      </Section>
      <Section spacing="tight">
        <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 border-b border-line pb-4">
          <nav aria-label="消息分類" className="flex flex-wrap gap-x-8 gap-y-2">
            {TABS.map((tab) => (
              <TextLink
                key={tab.label}
                href={pageHref(tab.category, 1)}
                current={tab.category === category}
                className={cn(
                  "text-body",
                  tab.category === category ? "text-ink" : "text-ink-secondary hover:text-ink",
                )}
              >
                {tab.label}
              </TextLink>
            ))}
          </nav>
          {summary.unread > 0 && (
            <form action={markAllNewsReadAction}>
              <Button type="submit" variant="outline">
                <CheckCheck aria-hidden="true" />
                全部標記已讀
              </Button>
            </form>
          )}
        </div>
        {list.items.length === 0 ? (
          <p className="mt-8 text-body text-ink-secondary">目前還沒有消息。</p>
        ) : (
          <ul aria-label="消息列表">
            {list.items.map((item) => (
              <li key={item.id} className="list-row relative isolate overflow-hidden border-b border-line">
                <Link
                  href={`/news/${item.id}`}
                  className="grid grid-cols-4 gap-x-4 gap-y-3 px-2 py-6 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none md:grid-cols-8 md:gap-x-6 lg:grid-cols-12"
                >
                  <div className="col-span-4 flex flex-col items-start gap-2 md:col-span-2">
                    <NewsMeta item={item} />
                    <div className="flex flex-wrap gap-2">
                      <NewsCategoryBadge category={item.category} />
                      {item.unread && <NewsUnreadBadge />}
                    </div>
                  </div>
                  <h2 className="col-span-4 font-heading text-h3 text-ink md:col-span-6 lg:col-span-9">{item.title}</h2>
                  <div className="hidden items-start justify-end lg:col-span-1 lg:flex">
                    <ArrowRight aria-hidden="true" className="list-row-arrow size-5 text-ink-muted" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
        {pages > 1 && (
          <nav aria-label="消息分頁" className="mt-6 flex items-center justify-between gap-4 text-body">
            {page > 1 ? <TextLink href={pageHref(category, page - 1)}>較新的消息</TextLink> : <span />}
            <MetaLabel>
              {page} / {pages}
            </MetaLabel>
            {page < pages ? <TextLink href={pageHref(category, page + 1)}>較早的消息</TextLink> : <span />}
          </nav>
        )}
      </Section>
    </main>
  );
}
