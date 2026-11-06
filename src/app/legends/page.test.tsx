import { render, screen, within } from "@testing-library/react";
import { fetchLegends } from "@/lib/public-content-client";
import type { Legends } from "@/types/legends";
import LegendsPage from "./page";

jest.mock("@/lib/public-content-client", () => ({ fetchLegends: jest.fn() }));

const legends: Legends = {
  overall: {
    title: "傳奇總榜",
    entries: [
      { rank: 1, nickname: "阿明", points: 29 },
      { rank: 2, nickname: "小華", points: 18 },
      { rank: 2, nickname: "小美", points: 18 },
      { rank: 4, nickname: "阿強", points: 9 },
    ],
  },
  boards: [
    {
      code: "scrim-matches",
      title: "內戰鐵人",
      metric: "參加內戰次數",
      unit: "場",
      countsTowardOverall: true,
      entries: [{ rank: 1, nickname: "阿明", value: 12 }],
    },
    {
      code: "scrim-cancelled",
      title: "放鳥大師",
      metric: "假參賽",
      unit: "場",
      countsTowardOverall: false,
      entries: [],
    },
    {
      code: "daily-check-in",
      title: "簽到狂人",
      metric: "每日簽到",
      unit: "天",
      countsTowardOverall: true,
      entries: [{ rank: 1, nickname: "小美", value: 30 }],
    },
  ],
};

async function renderPage(data: Legends = legends) {
  (fetchLegends as jest.Mock).mockResolvedValue(data);
  return render(await LegendsPage());
}

describe("LegendsPage", () => {
  it("shows the overall ranking first, then the boards in the backend's order", async () => {
    await renderPage();

    expect(screen.getByRole("heading", { level: 1, name: "傳奇榜" })).toBeInTheDocument();
    // Board headings only; the ⓘ popovers have their own (hidden in a browser until opened).
    const boardHeadings = screen.getAllByRole("heading", { level: 2 }).filter((h) => !h.closest("[popover]"));
    expect(boardHeadings.map((h) => h.textContent)).toEqual(["傳奇總榜", "內戰鐵人", "放鳥大師", "簽到狂人"]);
    // The fixed metric stays under each catchy title.
    expect(screen.getByRole("region", { name: "內戰鐵人" })).toHaveTextContent("參加內戰次數・單位：場");
    expect(screen.getByRole("region", { name: "傳奇總榜" })).toHaveTextContent("總排行・單位：分");
  });

  it("lists places, nicknames and values with the unit, ties sharing a place", async () => {
    await renderPage();

    const overall = screen.getByRole("list", { name: "傳奇總榜" });
    expect(
      within(overall)
        .getAllByRole("listitem")
        .map((row) => row.textContent),
    ).toEqual(["第 1 名01阿明29 分", "第 2 名02小華18 分", "第 2 名02小美18 分", "第 4 名04阿強9 分"]);
    expect(within(screen.getByRole("list", { name: "內戰鐵人" })).getByText("12 場")).toBeInTheDocument();
  });

  it("gives places 1 to 3 a gold, silver or bronze trophy, always with the place in words", async () => {
    await renderPage();

    const [first, second, tied, fourth] = within(screen.getByRole("list", { name: "傳奇總榜" })).getAllByRole(
      "listitem",
    );
    expect(first.querySelector("svg")).toHaveClass("text-gold");
    expect(second.querySelector("svg")).toHaveClass("text-silver");
    expect(tied.querySelector("svg")).toHaveClass("text-silver");
    expect(first).toHaveTextContent("第 1 名");
    expect(fourth.querySelector("svg")).toBeNull();
  });

  it("labels boards that do not count, and says when a board is empty", async () => {
    await renderPage();

    const noShows = screen.getByRole("region", { name: "放鳥大師" });
    expect(noShows).toHaveTextContent("不計入總排行");
    expect(noShows).toHaveTextContent("還沒有會員上榜");
    expect(screen.getByRole("region", { name: "內戰鐵人" })).not.toHaveTextContent("不計入總排行");
  });

  it("keeps the counting rules behind ⓘ popovers, with a line for visitors under each title", async () => {
    await renderPage();

    const pageInfo = screen.getByRole("button", { name: "「傳奇榜怎麼算」說明" });
    expect(pageInfo).toHaveAttribute("popovertarget", "legend-rules-page");
    const pageRules = document.getElementById("legend-rules-page") as HTMLElement;
    expect(pageRules).toHaveAttribute("popover", "auto");
    expect(pageRules).toHaveTextContent(/第 1 名 10 分、第 2 名 9 分/);
    expect(within(pageRules).getByRole("button", { name: "關閉" })).toHaveAttribute("popovertargetaction", "hide");

    const ironmen = screen.getByRole("region", { name: "內戰鐵人" });
    expect(ironmen).toHaveTextContent("從不缺席的內戰常駐戰力");
    expect(within(ironmen).getByRole("button", { name: "「內戰鐵人怎麼算」說明" })).toHaveAttribute(
      "popovertarget",
      "legend-rules-scrim-matches",
    );
    expect(document.getElementById("legend-rules-scrim-matches")).toHaveTextContent("隊伍確認之後的內戰場次");
  });

  it("explains the sub-party board on its own", async () => {
    await renderPage({
      ...legends,
      boards: [
        {
          code: "sub-party-attendance",
          title: "分場達人",
          metric: "參加子派對次數",
          unit: "次",
          countsTowardOverall: true,
          entries: [{ rank: 1, nickname: "阿明", value: 3 }],
        },
      ],
    });

    const board = screen.getByRole("region", { name: "分場達人" });
    expect(board).toHaveTextContent("參加子派對次數・單位：次");
    expect(board).toHaveTextContent("一個派對裡的每一場");
    expect(document.getElementById("legend-rules-sub-party-attendance")).toHaveTextContent("每個子派對算一次");
  });

  it("gives a board added later a default icon and no ⓘ", async () => {
    await renderPage();

    const added = screen.getByRole("heading", { level: 2, name: "簽到狂人" });
    expect(added.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    expect(within(screen.getByRole("region", { name: "簽到狂人" })).queryByRole("button")).toBeNull();
  });

  it("still shows the overall ranking when nobody is listed", async () => {
    await renderPage({ overall: { title: "傳奇總榜", entries: [] }, boards: [] });

    expect(screen.getByRole("region", { name: "傳奇總榜" })).toHaveTextContent("還沒有會員上榜");
  });

  it("explains the two points boards, the points one marked as not counting", async () => {
    await renderPage({
      ...legends,
      boards: [
        {
          code: "points-earned",
          title: "交易常客",
          metric: "累積獲得點數",
          unit: "點",
          countsTowardOverall: false,
          entries: [{ rank: 1, nickname: "阿明", value: 40 }],
        },
        {
          code: "checkin-streak",
          title: "全勤之王",
          metric: "最長連續簽到",
          unit: "天",
          countsTowardOverall: true,
          entries: [{ rank: 1, nickname: "小美", value: 21 }],
        },
      ],
    });

    const points = screen.getByRole("region", { name: "交易常客" });
    expect(points).toHaveTextContent("累積獲得點數・單位：點");
    expect(points).toHaveTextContent("不計入總排行");
    expect(document.getElementById("legend-rules-points-earned")).toHaveTextContent("花掉的點數不會扣除");

    const streak = screen.getByRole("region", { name: "全勤之王" });
    expect(streak).not.toHaveTextContent("不計入總排行");
    expect(within(screen.getByRole("list", { name: "全勤之王" })).getByText("21 天")).toBeInTheDocument();
    expect(document.getElementById("legend-rules-checkin-streak")).toHaveTextContent("只有漏簽一天才重新計算");
  });
});
