import { render, screen, within } from "@testing-library/react";
import { memberToken } from "@/lib/member-session";
import { fetchNews, fetchNewsList } from "@/lib/public-content-client";
import type { NewsItem } from "@/types/news";
import NewsItemPage from "./[id]/page";
import NewsPage from "./page";

jest.mock("@/lib/member-session", () => ({ memberToken: jest.fn() }));
jest.mock("@/lib/public-content-client", () => ({ fetchNewsList: jest.fn(), fetchNews: jest.fn() }));
jest.mock("@/app/news/actions", () => ({ markNewsReadAction: jest.fn() }));
const mockNotFound = jest.fn(() => {
  throw new Error("NEXT_NOT_FOUND");
});
jest.mock("next/navigation", () => ({ notFound: () => mockNotFound() }));

import { markNewsReadAction } from "@/app/news/actions";

const item = (id: string, overrides: Partial<NewsItem> = {}): NewsItem => ({
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

  it("marks the messages on screen as read for a signed-in member", async () => {
    (memberToken as jest.Mock).mockResolvedValue("token");
    (fetchNewsList as jest.Mock).mockResolvedValue({ items: [item("a"), item("b")], total: 2, page: 1, pageSize: 10 });
    render(await NewsPage(listProps()));

    expect(markNewsReadAction).toHaveBeenCalledWith(["a", "b"]);
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

  it("is a real 404 for a message that cannot be shown", async () => {
    (fetchNews as jest.Mock).mockResolvedValue(null);
    await expect(NewsItemPage(itemProps("missing"))).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
