import { render, screen, within } from "@testing-library/react";
import { fetchMemberProfile } from "@/lib/member-session";
import { fetchShop } from "@/lib/public-content-client";
import type { Shop } from "@/types/ice-cream";
import ShopPage from "./page";

jest.mock("@/lib/member-session", () => ({ fetchMemberProfile: jest.fn() }));
jest.mock("@/lib/public-content-client", () => ({ fetchShop: jest.fn() }));
jest.mock("@/app/member/actions", () => ({ claimIceCampaignAction: jest.fn(), claimQuestAction: jest.fn() }));

const shop = (overrides: Partial<Shop> = {}): Shop => ({
  checkin: { points: 1 },
  streakCampaign: { title: "十一月全勤", endDate: "2026-11-30", requiredDays: 10 },
  iceCampaigns: [
    { id: "c1", title: "聖誕限定", endDate: "2026-12-25", claimed: false },
    { id: "c2", title: "週年限定", endDate: "2026-12-31", claimed: true },
  ],
  createCost: 3,
  balance: 12,
  quests: [
    { code: "steam", title: "綁定 Steam", description: "綁定你的 Steam 帳號", points: 2, state: "claimable" },
    { code: "friend", title: "交到第一位好友", description: "被接受一次好友邀請", points: 1, state: "todo" },
    { code: "checkin", title: "第一次簽到", description: "簽到一次", points: 1, state: "claimed" },
  ],
  ...overrides,
});

async function renderPage(data: Shop, member: boolean) {
  // The backend sends a balance and quest states only with a member's token.
  (fetchShop as jest.Mock).mockResolvedValue(
    member ? data : { ...data, balance: null, quests: data.quests?.map((quest) => ({ ...quest, state: null })) },
  );
  (fetchMemberProfile as jest.Mock).mockResolvedValue(member ? { nickname: "小明" } : null);
  render(await ShopPage());
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
    expect(screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent)).toEqual(["冰炫風", "點數任務"]);
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
    expect(within(friend).getByRole("link", { name: "去完成" })).toHaveAttribute("href", "/member?tab=friends");
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
});
