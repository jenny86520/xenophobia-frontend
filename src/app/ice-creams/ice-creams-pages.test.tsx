import { render, screen, within } from "@testing-library/react";
import { fetchIceCreamAlbum } from "@/lib/member-session";
import type { IceEvent } from "@/types/ice-cream";
import IceCreamsPage from "./page";

jest.mock("@/lib/member-session", () => ({ fetchIceCreamAlbum: jest.fn() }));

const event = (id: string, type: string, overrides: Partial<IceEvent> = {}): IceEvent => ({
  id,
  serial: 12,
  iceCreamId: "i12",
  type,
  actor: { nickname: "小明" },
  target: { nickname: "小華" },
  note: "",
  // 04:00Z is 12:00 in Taiwan.
  createdAt: "2026-11-07T04:00:00.000Z",
  ...overrides,
});

const listProps = (page?: string) =>
  ({
    searchParams: Promise.resolve(page ? { page } : {}),
    params: Promise.resolve({}),
  }) as unknown as PageProps<"/ice-creams">;
const cover = (serial: number, overrides: Record<string, unknown> = {}) => ({
  id: `i${serial}`,
  serial,
  origin: "member",
  status: "held",
  issuer: { nickname: "小明" },
  holder: { nickname: "小華" },
  giftTo: null,
  giftExpiresAt: null,
  createdAt: "2026-11-07T04:00:00.000Z",
  endedAt: null,
  ...overrides,
});

describe("/ice-creams", () => {
  it("shows one card per token, each opening its own life in a dialog", async () => {
    (fetchIceCreamAlbum as jest.Mock).mockResolvedValue({
      items: [
        { iceCream: cover(13), events: [event("e9", "created", { serial: 13, iceCreamId: "i13", target: null })] },
        {
          iceCream: cover(12, { status: "retired", holder: null }),
          events: [
            event("e1", "created", { target: null }),
            event("e2", "redeemed_physical", { note: "已吃掉，好冰！" }),
          ],
        },
      ],
      total: 30,
      page: 1,
      pageSize: 12,
    });
    render(await IceCreamsPage(listProps()));

    const cards = Array.from(screen.getByRole("list", { name: "冰炫風成長史冊" }).children) as HTMLElement[];
    expect(cards).toHaveLength(2);
    const newest = within(cards[0]).getByRole("button", { name: /冰炫風 #13/ });
    expect(newest).toHaveTextContent("冰炫風 #13小明 發行小華・持有中");
    expect(newest).toHaveAttribute("popovertarget", "ice-detail-i13");

    // The dialog holds that token's details and only its own events, oldest first.
    const dialog = within(cards[1]).getByRole("dialog", { name: "冰炫風 #12" });
    expect(dialog).toHaveTextContent("結局功成身退");
    const life = within(dialog).getAllByRole("listitem");
    expect(life.map((row) => row.textContent)).toEqual([
      "2026/11/07 12:00小明 建立了這支冰炫風",
      "2026/11/07 12:00小明 請 小華 吃了冰炫風，功成身退：「已吃掉，好冰！」",
    ]);
    expect(screen.queryByRole("link", { name: /的頁面/ })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "較早的冰炫風" })).toHaveAttribute("href", "/ice-creams?page=2");
  });

  it("shows visitors nothing from the record", async () => {
    (fetchIceCreamAlbum as jest.Mock).mockResolvedValue(null);
    render(await IceCreamsPage(listProps()));
    expect(screen.getByText("登入會員後即可查看。")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });
});
