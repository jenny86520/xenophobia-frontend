import { render, screen, within } from "@testing-library/react";
import { fetchMemberProfile } from "@/lib/member-session";
import { fetchShop } from "@/lib/public-content-client";
import type { Shop } from "@/types/ice-cream";
import ShopPage from "./page";

jest.mock("@/lib/member-session", () => ({ fetchMemberProfile: jest.fn() }));
jest.mock("@/lib/public-content-client", () => ({ fetchShop: jest.fn() }));
jest.mock("@/app/member/actions", () => ({
  claimIceCampaignAction: jest.fn(),
  claimQuestAction: jest.fn(),
  buyCosmeticAction: jest.fn(),
}));

const shop = (overrides: Partial<Shop> = {}): Shop => ({
  checkin: { points: 1 },
  streakCampaign: {
    title: "十一月全勤",
    endDate: "2026-11-30",
    requiredDays: 10,
  },
  iceCampaigns: [
    { id: "c1", title: "聖誕限定", endDate: "2026-12-25", claimed: false },
    { id: "c2", title: "週年限定", endDate: "2026-12-31", claimed: true },
  ],
  createCost: 3,
  balance: 12,
  quests: [
    {
      code: "steam",
      title: "綁定 Steam",
      description: "綁定你的 Steam 帳號",
      points: 2,
      state: "claimable",
    },
    {
      code: "friend",
      title: "交到第一位好友",
      description: "被接受一次好友邀請",
      points: 1,
      state: "todo",
    },
    {
      code: "checkin",
      title: "第一次簽到",
      description: "簽到一次",
      points: 1,
      state: "claimed",
    },
  ],
  ...overrides,
});

async function renderPage(data: Shop, member: boolean, query: Record<string, string> = {}) {
  // The backend sends a balance, quest states and what the member owns only with a member's token.
  (fetchShop as jest.Mock).mockResolvedValue(
    member
      ? data
      : {
          ...data,
          balance: null,
          quests: data.quests?.map((quest) => ({ ...quest, state: null })),
          cosmetics: data.cosmetics?.map((item) => ({
            ...item,
            owned: null,
            stock: null,
          })),
        },
  );
  (fetchMemberProfile as jest.Mock).mockResolvedValue(member ? { nickname: "小明" } : null);
  render(
    await ShopPage({
      params: Promise.resolve({}),
      searchParams: Promise.resolve(query),
    } as PageProps<"/shop">),
  );
}

describe("/shop", () => {
  const shelf = (name: string) => Array.from(screen.getByRole("list", { name }).children) as HTMLElement[];
  const ids = (cards: HTMLElement[]) => cards.map((card) => card.getAttribute("aria-labelledby"));

  it("puts ice creams on one shelf and the ways to earn points on another", async () => {
    await renderPage(shop(), true);

    // The member's points float at the top right, under the header, clear of the corner.
    const balance = screen.getByRole("link", { name: "我的點數 12" });
    expect(balance).toHaveAttribute("href", "/member?tab=points");
    expect(balance).toHaveClass("fixed", "top-24");

    // Two shelves, each named by its heading; square cards named by their product.
    expect(screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent)).toEqual([
      "冰炫風",
      "點數任務",
      "外觀",
    ]);
    const iceCreams = shelf("冰炫風");
    const tasks = shelf("點數任務");
    expect(ids(iceCreams)).toEqual(["product-c1", "product-c2", "product-create"]);
    expect(ids(tasks)).toEqual([
      "product-checkin",
      "product-streak",
      "product-quest-steam",
      "product-quest-friend",
      "product-quest-checkin",
    ]);
    [...iceCreams, ...tasks].forEach((card) => expect(card).toHaveClass("aspect-square"));

    const [christmas, anniversary, create] = iceCreams;
    const [checkin, streak, steam, friend, firstCheckin] = tasks;
    expect(christmas).toHaveAccessibleName("聖誕限定・冰炫風");
    expect(christmas).toHaveTextContent("期間限定");
    expect(christmas).toHaveTextContent("免費");
    expect(christmas).toHaveTextContent("每人限兌換一次・2026/12/25 結束");
    expect(within(christmas).getByRole("button", { name: "兌換" })).toBeInTheDocument();
    expect(christmas.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    expect(anniversary).toHaveTextContent("已兌換");
    expect(within(anniversary).queryByRole("button")).not.toBeInTheDocument();

    expect(create).not.toHaveTextContent("期間限定");
    expect(create).toHaveTextContent("3 點");
    expect(within(create).getByRole("link", { name: "到我的冰炫風建立" })).toHaveAttribute(
      "href",
      "/member?tab=ice-creams",
    );
    expect(checkin).toHaveAccessibleName("每日簽到");
    expect(checkin).toHaveTextContent("+1 點");
    expect(within(checkin).getByRole("link", { name: "前往簽到" })).toHaveAttribute("href", "/member?tab=points");
    expect(streak).toHaveAccessibleName("十一月全勤");
    expect(streak).toHaveTextContent("連續簽到滿 10 天・2026/11/30 結束");
    expect(screen.getByRole("link", { name: "冰炫風成長史冊" })).toHaveAttribute("href", "/ice-creams");

    expect(steam).toHaveAccessibleName("綁定 Steam");
    expect(steam).toHaveTextContent("新手任務");
    expect(steam).toHaveTextContent("+2 點");
    expect(within(steam).getByRole("button", { name: "領取" })).toBeInTheDocument();
    // Opens the friends sidebar right on the shop page.
    expect(within(friend).getByRole("button", { name: "去完成" })).toHaveAttribute("popovertarget", "friends-panel");
    expect(firstCheckin).toHaveTextContent("已領取");
    expect(within(firstCheckin).queryByRole("button")).not.toBeInTheDocument();
  });

  it("asks visitors to sign in, and leaves out what is not running", async () => {
    await renderPage(shop(), false);
    expect(screen.getAllByRole("link", { name: "登入會員後即可兌換" })).toHaveLength(2);
    expect(screen.getByRole("link", { name: "登入會員後即可建立" })).toHaveAttribute("href", "/member/login");
    expect(screen.getAllByRole("link", { name: "登入會員後即可簽到" })).toHaveLength(2);
    expect(screen.queryByRole("link", { name: /我的點數/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "兌換" })).not.toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "登入會員後即可領取" })).toHaveLength(3);
    expect(screen.queryByRole("button", { name: "領取" })).not.toBeInTheDocument();

    document.body.innerHTML = "";
    // An older backend sends no quests at all.
    await renderPage(shop({ iceCampaigns: [], streakCampaign: null, quests: undefined }), false);
    expect(ids(shelf("冰炫風"))).toEqual(["product-create"]);
    expect(ids(shelf("點數任務"))).toEqual(["product-checkin"]);
  });

  describe("外觀 shelf", () => {
    const cosmetics: NonNullable<Shop["cosmetics"]> = [
      {
        id: "t1",
        kind: "title",
        name: "派對常客",
        price: 30,
        look: {
          template: "title.basic",
          params: { text: "派對常客", textColor: "#ffd166" },
          imageUrl: null,
        },
        owned: true,
        stock: null,
      },
      {
        id: "f1",
        kind: "frame",
        name: "霓虹框",
        price: 40,
        look: {
          template: "frame.pulse",
          params: {
            mainColor: "#00e5ff",
            accentColor: "#ff3df0",
            speed: "slow",
          },
          imageUrl: null,
        },
        owned: false,
        stock: null,
      },
      {
        id: "c1",
        kind: "cup",
        name: "聖誕杯",
        price: 5,
        look: {
          template: "cup.classic",
          params: { lineColor: "#f5f5f5", cupColor: "#c62a2f" },
          imageUrl: null,
        },
        owned: null,
        stock: 1,
      },
    ];

    it("previews each cosmetic, marks owned ones and keeps cups buyable with their stock", async () => {
      await renderPage(shop({ cosmetics }), true);
      const [title, frame, cup] = shelf("外觀");
      expect(title).toHaveAccessibleName("派對常客");
      expect(title).toHaveTextContent("30 點");
      expect(title).toHaveTextContent("稱號・永久");
      expect(title).toHaveTextContent("已擁有");
      expect(within(title).queryByRole("button")).not.toBeInTheDocument();
      expect(within(frame).getByRole("button", { name: "購買" })).toBeInTheDocument();
      expect(frame.querySelector("[data-frame='frame.pulse']")).not.toBeNull();
      expect(cup).toHaveTextContent("冰炫風杯・換一次・庫存 1");
      expect(within(cup).getByRole("button", { name: "購買" })).toBeInTheDocument();
      expect(cup.querySelector("svg[data-cup='cup.classic']")).not.toBeNull();
    });

    it("asks before buying: the price and no refund in a dialog holding the only submit", async () => {
      await renderPage(shop({ cosmetics }), true);
      const [, frame, cup] = shelf("外觀");
      const open = within(frame).getByRole("button", { name: "購買" });
      expect(open).toHaveAttribute("type", "button");
      const dialog = document.getElementById(open.getAttribute("popovertarget") ?? "");
      expect(dialog).toHaveAttribute("popover", "auto");
      expect(dialog).toHaveTextContent("要用 40 點購買「霓虹框」嗎？");
      expect(dialog).toHaveTextContent("購買後不能退點");
      expect(within(dialog!).getByRole("button", { name: "確認購買" })).toHaveAttribute("type", "submit");
      expect(within(dialog!).getByRole("button", { name: "取消" })).toHaveAttribute("type", "button");
      const cupDialog = document.getElementById(
        within(cup).getByRole("button", { name: "購買" }).getAttribute("popovertarget") ?? "",
      );
      expect(cupDialog).toHaveTextContent("每個冰炫風杯只能換到一支冰炫風上");
    });

    it("tags limited items, meters what is left and marks sold-out ones without a buy button", async () => {
      const limited: NonNullable<Shop["cosmetics"]> = [
        {
          ...cosmetics[2],
          stockLimit: 20,
          remaining: 3,
          saleEndsOn: "2026-12-31",
          soldOut: false,
        },
        {
          ...cosmetics[1],
          id: "f2",
          name: "跨年框",
          stockLimit: 5,
          remaining: 0,
          saleEndsOn: null,
          soldOut: true,
        },
        {
          ...cosmetics[1],
          id: "f3",
          name: "常駐框",
          stockLimit: null,
          remaining: null,
          saleEndsOn: null,
          soldOut: false,
        },
      ];
      await renderPage(shop({ cosmetics: limited }), true);
      const [cup, frame, plain] = shelf("外觀");
      expect(within(cup).getByText("限量 20 份")).toBeInTheDocument();
      expect(cup.querySelector("[data-stock-meter]")).toHaveTextContent("剩餘3 / 20 份");
      expect(cup).toHaveTextContent("12/31 停售");
      expect(cup).not.toHaveAttribute("data-sold-out");

      expect(within(frame).getByText("限量 5 份")).toBeInTheDocument();
      expect(frame).toHaveAttribute("data-sold-out", "true");
      expect(within(frame).getAllByText("已售完").length).toBeGreaterThan(0);
      expect(within(frame).queryByRole("button")).not.toBeInTheDocument();

      expect(plain.querySelector("[data-stock-meter]")).toBeNull();
      expect(within(plain).queryByText(/限量/)).not.toBeInTheDocument();
    });

    it("asks visitors to sign in and says when nothing is on sale", async () => {
      await renderPage(shop({ cosmetics }), false);
      for (const card of shelf("外觀")) {
        expect(within(card).getByRole("link", { name: "登入會員後即可購買" })).toHaveAttribute("href", "/member/login");
      }
    });

    it("says when there is nothing on sale", async () => {
      await renderPage(shop({ cosmetics: [] }), true);
      expect(shelf("外觀")[0]).toHaveTextContent("目前沒有外觀商品");
      expect(screen.queryByRole("navigation", { name: "外觀分類" })).not.toBeInTheDocument();
    });

    describe("categories", () => {
      const cosmeticCategories = [
        { id: "xmas", name: "聖誕系列" },
        { id: "party", name: "派對限定" },
        { id: "spring", name: "新春" },
      ];
      // 派對常客 (owned) and 霓虹框 in 派對限定, 聖誕杯 in 聖誕系列, plus an item with no category.
      const sorted: NonNullable<Shop["cosmetics"]> = [
        { ...cosmetics[0], categoryId: "party" },
        { ...cosmetics[1], categoryId: "party" },
        { ...cosmetics[2], categoryId: "xmas" },
        { ...cosmetics[1], id: "f9", name: "常駐框", categoryId: null },
      ];
      const tabs = () =>
        within(screen.getByRole("navigation", { name: "外觀分類" }))
          .getAllByRole("link")
          .map((link) => link.textContent);

      it("tabs the categories with items in the admins' order, 其他 last, and sections 全部", async () => {
        await renderPage(shop({ cosmetics: sorted, cosmeticCategories }), true);
        expect(tabs()).toEqual(["全部 4", "聖誕系列 1", "派對限定 2", "其他 1"]);
        expect(screen.getByRole("link", { name: "全部 4" })).toHaveAttribute("aria-current", "page");
        expect(screen.getByRole("link", { name: "派對限定 2" })).toHaveAttribute(
          "href",
          "/shop?category=party#shelf-cosmetics",
        );
        expect(screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual([
          "聖誕系列",
          "派對限定",
          "其他",
        ]);
        expect(ids(shelf("聖誕系列"))).toEqual(["product-cosmetic-c1"]);
        expect(ids(shelf("派對限定"))).toEqual(["product-cosmetic-t1", "product-cosmetic-f1"]);
        expect(ids(shelf("其他"))).toEqual(["product-cosmetic-f9"]);
      });

      it("shows one category under its tab, without a sub-heading", async () => {
        await renderPage(shop({ cosmetics: sorted, cosmeticCategories }), true, {
          category: "party",
        });
        expect(screen.getByRole("link", { name: "派對限定 2" })).toHaveAttribute("aria-current", "page");
        expect(screen.queryAllByRole("heading", { level: 3 })).toHaveLength(0);
        expect(ids(shelf("外觀"))).toEqual(["product-cosmetic-t1", "product-cosmetic-f1"]);
        // The other shelves stay.
        expect(ids(shelf("冰炫風"))).toContain("product-create");
      });

      it("treats an unknown or empty category as 全部", async () => {
        await renderPage(shop({ cosmetics: sorted, cosmeticCategories }), true, {
          category: "spring",
        });
        expect(screen.getByRole("link", { name: "全部 4" })).toHaveAttribute("aria-current", "page");
      });

      it("has only 全部 and 其他 without categories", async () => {
        await renderPage(shop({ cosmetics }), false);
        expect(tabs()).toEqual(["全部 3", "其他 3"]);
        expect(shelf("外觀")).toHaveLength(3);
      });

      it("lets a member hide what they own, keeping cups and the counts", async () => {
        await renderPage(shop({ cosmetics: sorted, cosmeticCategories }), true, {
          category: "party",
        });
        expect(screen.getByRole("link", { name: "隱藏已擁有" })).toHaveAttribute(
          "href",
          "/shop?category=party&owned=hide#shelf-cosmetics",
        );

        document.body.innerHTML = "";
        await renderPage(shop({ cosmetics: sorted, cosmeticCategories }), true, {
          category: "party",
          owned: "hide",
        });
        expect(ids(shelf("外觀"))).toEqual(["product-cosmetic-f1"]);
        expect(tabs()).toContain("派對限定 2");
        expect(screen.getByRole("link", { name: "顯示已擁有" })).toHaveAttribute(
          "href",
          "/shop?category=party#shelf-cosmetics",
        );
        // Tabs keep the toggle.
        expect(screen.getByRole("link", { name: "全部 4" })).toHaveAttribute(
          "href",
          "/shop?owned=hide#shelf-cosmetics",
        );

        document.body.innerHTML = "";
        await renderPage(shop({ cosmetics: sorted, cosmeticCategories }), true, {
          category: "xmas",
          owned: "hide",
        });
        // A cup is never hidden.
        expect(ids(shelf("外觀"))).toEqual(["product-cosmetic-c1"]);
      });

      it("says so when everything in a tab is owned", async () => {
        const owned = sorted.map((item) => (item.id === "f1" ? { ...item, owned: true } : item));
        await renderPage(shop({ cosmetics: owned, cosmeticCategories }), true, {
          category: "party",
          owned: "hide",
        });
        expect(screen.getByText(/這類外觀你都擁有了/)).toBeInTheDocument();
        const show = screen.getAllByRole("link", { name: "顯示已擁有" });
        show.forEach((link) => expect(link).toHaveAttribute("href", "/shop?category=party#shelf-cosmetics"));
      });

      it("gives visitors no hide link and ignores owned=hide", async () => {
        await renderPage(shop({ cosmetics: sorted, cosmeticCategories }), false, {
          owned: "hide",
        });
        expect(screen.queryByRole("link", { name: /已擁有/ })).not.toBeInTheDocument();
        expect(tabs()).toEqual(["全部 4", "聖誕系列 1", "派對限定 2", "其他 1"]);
        expect(ids(shelf("派對限定"))).toHaveLength(2);
      });
    });
  });

  it("links to each shelf from the page header", async () => {
    await renderPage(shop(), false);
    const nav = screen.getByRole("navigation", { name: "商店分類" });
    expect(
      within(nav)
        .getAllByRole("link")
        .map((link) => [link.textContent, link.getAttribute("href")]),
    ).toEqual([
      ["冰炫風", "#shelf-ice-creams"],
      ["點數任務", "#shelf-tasks"],
      ["外觀", "#shelf-cosmetics"],
    ]);
    expect(document.getElementById("shelf-tasks")).toHaveTextContent("點數任務");
  });
});
