import { render, screen, within } from "@testing-library/react";
import type { NewsItem } from "@/types/news";
import { News } from "./news";

const item = (id: string, title: string, publishAt: string): NewsItem =>
  ({ id, title, content: "", category: "news", version: null, publishAt, visibility: "public" }) as NewsItem;

describe("News (home)", () => {
  it("lists each message as a link to its page, in the backend's order, with its Taiwan date", () => {
    render(
      <News
        index={5}
        items={[item("n2", "冬季派對報名開始", "2026-11-08T04:00:00.000Z"), item("n1", "新成員加入", "2026-11-01T04:00:00.000Z")]}
      />,
    );
    const rows = within(screen.getByRole("list", { name: "最新消息" })).getAllByRole("listitem");
    expect(rows.map((row) => within(row).getByRole("heading", { level: 3 }).textContent)).toEqual([
      "冬季派對報名開始",
      "新成員加入",
    ]);
    expect(within(rows[0]).getByRole("link")).toHaveAttribute("href", "/news/n2");
    expect(rows[0]).toHaveTextContent("2026-11-08");
  });

  it("links All news to the 最新消息 category", () => {
    render(<News index={5} items={[]} />);
    expect(screen.getByRole("link", { name: /All news/ })).toHaveAttribute("href", "/news?category=news");
  });

  it("says there is no news yet instead of a placeholder", () => {
    const { container } = render(<News index={5} items={[]} />);
    expect(screen.getByText("目前還沒有消息。")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    expect(container.querySelector("[data-placeholder]")).toBeNull();
  });
});
