import { render, screen } from "@testing-library/react";
import { fetchMemberFriendProfile, fetchMemberProfile } from "@/lib/member-session";
import type { FriendProfile } from "@/types/friends";
import FriendPage from "./[memberId]/page";

jest.mock("@/lib/member-session", () => ({
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
