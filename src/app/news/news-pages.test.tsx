import { render, screen, within } from "@testing-library/react";
import { fetchMemberNewsSummary, memberToken } from "@/lib/member-session";
import { fetchNews, fetchNewsList } from "@/lib/public-content-client";
import type { NewsListItem } from "@/types/news";
import NewsItemPage from "./[id]/page";
import NewsPage from "./page";

jest.mock("@/lib/member-session", () => ({ memberToken: jest.fn(), fetchMemberNewsSummary: jest.fn() }));
jest.mock("@/lib/public-content-client", () => ({ fetchNewsList: jest.fn(), fetchNews: jest.fn() }));
jest.mock("@/app/news/actions", () => ({ markNewsReadAction: jest.fn(), markAllNewsReadAction: jest.fn() }));
const mockNotFound = jest.fn(() => {
  throw new Error("NEXT_NOT_FOUND");
});
jest.mock("next/navigation", () => ({ notFound: () => mockNotFound() }));

import { markAllNewsReadAction, markNewsReadAction } from "@/app/news/actions";

const item = (id: string, overrides: Partial<NewsListItem> = {}): NewsListItem => ({
  id,
  title: `消息 ${id}`,
  content: "# 新功能\n\n- 每日簽到\n- 冰炫風",
  category: "news",
  version: null,
  // 16:00Z is the next day in Taiwan.
  publishAt: "2026-11-07T16:00:00.000Z",
  visibility: "public",
  ...overrides,
});

const listProps = (query: Record<string, string> = {}) =>
  ({ searchParams: Promise.resolve(query), params: Promise.resolve({}) }) as unknown as PageProps<"/news">;
const itemProps = (id: string) =>
  ({ params: Promise.resolve({ id }), searchParams: Promise.resolve({}) }) as unknown as PageProps<"/news/[id]">;

beforeEach(() => {
  jest.clearAllMocks();
  (memberToken as jest.Mock).mockResolvedValue(null);
  (fetchMemberNewsSummary as jest.Mock).mockResolvedValue({ unread: 0, reminders: [] });
});

describe("/news", () => {
  it("lists messages newest first with their category, Taiwan date and version", async () => {
    (fetchNewsList as jest.Mock).mockResolvedValue({
      items: [item("b", { category: "update", version: "v1.3.0", title: "點數商店上線" }), item("a")],
      total: 2,
      page: 1,
      pageSize: 10,
    });
    render(await NewsPage(listProps()));

    const rows = within(screen.getByRole("list", { name: "消息列表" })).getAllByRole("link");
    expect(rows.map((row) => row.getAttribute("href"))).toEqual(["/news/b", "/news/a"]);
    expect(rows[0]).toHaveTextContent("網站更新");
    expect(rows[0]).toHaveTextContent("2026-11-08・v1.3.0");
    expect(rows[1]).toHaveTextContent("最新消息");
    expect(screen.getByRole("link", { name: "全部" })).toHaveAttribute("aria-current", "page");
    expect(markNewsReadAction).not.toHaveBeenCalled();
  });

  it("filters by the category in the URL and links the pages", async () => {
    (fetchNewsList as jest.Mock).mockResolvedValue({
      items: [item("u", { category: "update" })],
      total: 25,
      page: 2,
      pageSize: 10,
    });
    render(await NewsPage(listProps({ category: "update", page: "2" })));

    expect(fetchNewsList).toHaveBeenCalledWith("update", 2);
    expect(screen.getByRole("link", { name: "網站更新" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "較新的消息" })).toHaveAttribute("href", "/news?category=update");
    expect(screen.getByRole("link", { name: "較早的消息" })).toHaveAttribute("href", "/news?category=update&page=3");
  });

  it("ignores an unknown category and says when there is nothing yet", async () => {
    (fetchNewsList as jest.Mock).mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 10 });
    render(await NewsPage(listProps({ category: "other" })));

    expect(fetchNewsList).toHaveBeenCalledWith(null, 1);
    expect(screen.getByText("目前還沒有消息。")).toBeInTheDocument();
  });

  it("tags what the member has not opened, marks nothing, and offers 全部標記已讀", async () => {
    (memberToken as jest.Mock).mockResolvedValue("token");
    (fetchMemberNewsSummary as jest.Mock).mockResolvedValue({ unread: 3, reminders: [] });
    (fetchNewsList as jest.Mock).mockResolvedValue({
      items: [item("a", { unread: true }), item("b", { unread: false })],
      total: 2,
      page: 1,
      pageSize: 10,
    });
    render(await NewsPage(listProps()));

    const rows = within(screen.getByRole("list", { name: "消息列表" })).getAllByRole("link");
    expect(within(rows[0]).getByText("未讀")).toBeInTheDocument();
    expect(rows[0]).toHaveTextContent("NEW");
    expect(rows[1]).not.toHaveTextContent("NEW");
    expect(rows[1]).not.toHaveTextContent("未讀");
    expect(markNewsReadAction).not.toHaveBeenCalled();

    const button = screen.getByRole("button", { name: "全部標記已讀" });
    expect(button).toHaveAttribute("type", "submit");
    expect(button.closest("form")).not.toBeNull();
    expect(markAllNewsReadAction).not.toHaveBeenCalled();
  });

  it("shows no NEW tags and no 全部標記已讀 without unread messages", async () => {
    (fetchNewsList as jest.Mock).mockResolvedValue({ items: [item("a")], total: 1, page: 1, pageSize: 10 });
    render(await NewsPage(listProps()));

    expect(screen.queryByText("NEW")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "全部標記已讀" })).not.toBeInTheDocument();
  });
});

describe("/news/[id]", () => {
  it("shows the full text laid out as headings and lists", async () => {
    (fetchNews as jest.Mock).mockResolvedValue(item("a", { title: "點數商店上線" }));
    render(await NewsItemPage(itemProps("a")));

    expect(screen.getByRole("heading", { level: 1, name: "點數商店上線" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "新功能" })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem").map((li) => li.textContent)).toEqual(["每日簽到", "冰炫風"]);
  });

  it("puts the way back above the title and marks the message read for a member", async () => {
    (memberToken as jest.Mock).mockResolvedValue("token");
    (fetchNews as jest.Mock).mockResolvedValue(item("a", { title: "點數商店上線" }));
    render(await NewsItemPage(itemProps("a")));

    const back = screen.getByRole("link", { name: "最新消息" });
    expect(back).toHaveAttribute("href", "/news");
    const title = screen.getByRole("heading", { level: 1 });
    expect(back.compareDocumentPosition(title) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.queryByRole("link", { name: "回到最新消息" })).not.toBeInTheDocument();
    expect(markNewsReadAction).toHaveBeenCalledWith(["a"]);
  });

  it("is a real 404 for a message that cannot be shown", async () => {
    (fetchNews as jest.Mock).mockResolvedValue(null);
    await expect(NewsItemPage(itemProps("missing"))).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
