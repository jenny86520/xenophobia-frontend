import { Megaphone, Sparkles, Wrench } from "lucide-react";
import { MetaLabel } from "@/components/brand/meta-label";
import { Badge } from "@/components/ui/badge";
import type { NewsCategory, NewsItem } from "@/types/news";
import { formatTaipeiDate } from "@/utils/datetime";

/** Chinese names of the categories, as the tabs and badges say them. */
export const NEWS_CATEGORY_LABELS: Record<NewsCategory, string> = { news: "最新消息", update: "網站更新" };

const CATEGORY_ICONS = { news: Megaphone, update: Wrench } as const;

/** The category as text with a decorative icon (never colour alone). */
export function NewsCategoryBadge({ category }: { category: NewsCategory }) {
  const Icon = CATEGORY_ICONS[category] ?? Megaphone;
  return (
    <Badge variant="outline" className="gap-1.5">
      <Icon aria-hidden="true" />
      {NEWS_CATEGORY_LABELS[category] ?? category}
    </Badge>
  );
}

/** A message the member has not opened yet: text plus a decorative icon, never colour alone. */
export function NewsUnreadBadge() {
  return (
    <Badge className="gap-1.5">
      <Sparkles aria-hidden="true" />
      <span lang="en" aria-hidden="true">
        NEW
      </span>
      <span className="sr-only">未讀</span>
    </Badge>
  );
}

/** The Taiwan publish day, plus the version for site updates that carry one (e.g. 2026-11-08・v1.3.0). */
export function NewsMeta({ item }: { item: Pick<NewsItem, "publishAt" | "version"> }) {
  return (
    <MetaLabel>
      <time dateTime={item.publishAt}>{formatTaipeiDate(item.publishAt)}</time>
      {item.version && <span>・{item.version}</span>}
    </MetaLabel>
  );
}
