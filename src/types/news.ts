/** 最新消息 or 網站更新. */
export type NewsCategory = "news" | "update";

export type NewsItem = {
  id: string;
  title: string;
  /** Plain text in the legal documents' format (blank line, "# ", "- "). */
  content: string;
  category: NewsCategory;
  /** "v1.3.0" on some 網站更新, else null. */
  version: string | null;
  /** ISO instant; shown in Taiwan time. */
  publishAt: string;
  visibility: "public" | "members";
};

export type NewsPage = { items: NewsItem[]; total: number; page: number; pageSize: number };

export type NewsReminder = { id: string; title: string; publishAt: string; excerpt: string };

/** The member's unread count (header) and the messages the reminder popup shows. */
export type NewsSummary = { unread: number; reminders: NewsReminder[] };
