import { render, screen, within } from "@testing-library/react";
import { fetchIceCream, fetchMemberFriendProfile, fetchMemberProfile } from "@/lib/member-session";
import type { FriendProfile } from "@/types/friends";
import FriendPage from "./[memberId]/page";

jest.mock("@/lib/member-session", () => ({
  fetchIceCream: jest.fn(),
  fetchMemberProfile: jest.fn(),
  fetchMemberFriendProfile: jest.fn(),
}));
// The note form calls a Server Action; the page only needs it to exist.
jest.mock("@/app/member/actions", () => ({
  updateFriendNoteAction: jest.fn(),
  removeFriendAction: jest.fn(),
  sendFriendRequestAction: jest.fn(),
}));

const props = (memberId = "m2") =>
  ({ params: Promise.resolve({ memberId }) }) as unknown as PageProps<"/member/friends/[memberId]">;

const hua: FriendProfile = {
  memberId: "m2",
  nickname: "小華",
  memberCode: "XPA-0002",
  discordId: "hua#1234",
  steam: { steamName: "Hua", profileUrl: "https://steamcommunity.com/profiles/76561198000000002" },
  rating: 1200,
  note: "大學室友",
  iceCreams: [],
};

beforeEach(() => {
  jest.clearAllMocks();
  (fetchMemberProfile as jest.Mock).mockResolvedValue({ nickname: "阿明" });
});

describe("/member/friends/[memberId]", () => {
  it("shows the friend's code, Discord ID, Steam account, rating and the member's note", async () => {
    (fetchMemberFriendProfile as jest.Mock).mockResolvedValue(hua);
    render(await FriendPage(props()));

    expect(fetchMemberFriendProfile).toHaveBeenCalledWith("m2");
    expect(screen.getByRole("heading", { level: 1, name: "小華" })).toBeInTheDocument();
    for (const value of ["XPA-0002", "hua#1234", "1200"]) {
      expect(screen.getAllByText(value).length).toBeGreaterThan(0);
    }
    const steam = screen.getByRole("link", { name: /Hua/ });
    expect(steam).toHaveAttribute("href", "https://steamcommunity.com/profiles/76561198000000002");
    expect(steam).toHaveAttribute("target", "_blank");
    expect(screen.getByLabelText("備註")).toHaveValue("大學室友");
    expect(screen.getByLabelText("備註")).toHaveAttribute("maxlength", "50");
    expect(screen.getByRole("link", { name: /好友/ })).toHaveAttribute("href", "/member?tab=friends");
  });

  it("shows the friend's ice creams as cards without actions, each opening its life in a dialog", async () => {
    (fetchMemberFriendProfile as jest.Mock).mockResolvedValue({
      ...hua,
      iceCreams: [
        { id: "i12", serial: 12, status: "held", issuer: "阿明" },
        { id: "i3", serial: 3, status: "redeeming", issuer: "管理員" },
      ],
    });
    (fetchIceCream as jest.Mock).mockImplementation(async (id: string) =>
      id === "i12"
        ? {
            iceCream: {
              id: "i12",
              serial: 12,
              origin: "member",
              status: "held",
              issuer: { nickname: "阿明" },
              holder: { nickname: "小華" },
              giftTo: null,
              giftExpiresAt: null,
              createdAt: "2026-11-07T04:00:00.000Z",
              endedAt: null,
            },
            events: [
              {
                id: "e1",
                serial: 12,
                iceCreamId: "i12",
                type: "created",
                actor: { nickname: "阿明" },
                target: null,
                note: "",
                createdAt: "2026-11-07T04:00:00.000Z",
              },
            ],
          }
        : null,
    );
    render(await FriendPage(props()));

    const cards = Array.from(screen.getByRole("list", { name: "小華的冰炫風" }).children) as HTMLElement[];
    expect(cards).toHaveLength(2);
    // #12 opens its detail dialog; there is nothing to give or redeem on a friend's page.
    const open = within(cards[0]).getByRole("button", { name: /冰炫風 #12/ });
    expect(open).toHaveAttribute("popovertarget", "ice-detail-i12");
    expect(open).toHaveTextContent("冰炫風 #12阿明 發行小華・持有中");
    const dialog = within(cards[0]).getByRole("dialog", { name: "冰炫風 #12" });
    expect(within(dialog).getByRole("list", { name: "冰炫風 #12的一生" })).toHaveTextContent("阿明 建立了這支冰炫風");
    expect(screen.queryByRole("button", { name: "贈送" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "兌換" })).not.toBeInTheDocument();
    // A token whose life could not be read still shows its card, without a dialog.
    expect(cards[1]).toHaveTextContent("冰炫風 #3管理員 發行小華・兌換中");
    expect(within(cards[1]).queryByRole("button")).not.toBeInTheDocument();
    expect(cards[0].querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("says when the friend has no ice creams", async () => {
    (fetchMemberFriendProfile as jest.Mock).mockResolvedValue(hua);
    render(await FriendPage(props()));
    expect(screen.getByText("目前沒有冰炫風。")).toBeInTheDocument();
  });

  it("says when the friend has no Steam account, without a rating", async () => {
    (fetchMemberFriendProfile as jest.Mock).mockResolvedValue({ ...hua, steam: null, rating: null, note: null });
    render(await FriendPage(props()));

    expect(screen.getByText("尚未綁定 Steam")).toBeInTheDocument();
    expect(screen.queryByText("內戰分數")).not.toBeInTheDocument();
    expect(screen.getByLabelText("備註")).toHaveValue("");
  });

  it("says the friend cannot be found when the backend answers 404", async () => {
    (fetchMemberFriendProfile as jest.Mock).mockResolvedValue(null);
    render(await FriendPage(props("stranger")));

    expect(screen.getByRole("heading", { level: 1, name: "找不到這位好友" })).toBeInTheDocument();
    expect(screen.queryByLabelText("備註")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /好友/ })).toHaveAttribute("href", "/member?tab=friends");
  });

  it("only explains how to become a member when signed out", async () => {
    (fetchMemberProfile as jest.Mock).mockResolvedValue(null);
    render(await FriendPage(props()));

    expect(screen.getByText(/此頁僅限會員/)).toBeInTheDocument();
    expect(fetchMemberFriendProfile).not.toHaveBeenCalled();
  });
});
