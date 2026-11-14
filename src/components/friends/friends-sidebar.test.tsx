import { render, screen, within } from "@testing-library/react";
import type { FriendsOverview } from "@/types/friends";
import { FRIENDS_PANEL_ID } from "./friends-panel-id";
import { FriendsSidebar } from "./friends-sidebar";

jest.mock("next/navigation", () => ({ usePathname: () => "/legends" }));
jest.mock("@/app/member/actions", () => ({
  acceptMatchInviteAction: jest.fn(),
  answerFriendRequestAction: jest.fn(),
  dismissMatchInviteAction: jest.fn(),
  removeFriendAction: jest.fn(),
  sendFriendRequestAction: jest.fn(),
  updateFriendNoteAction: jest.fn(),
}));

const overview: FriendsOverview = {
  memberCode: "XPA-0001",
  friends: [],
  incoming: [],
  outgoing: [],
  matchInvites: [],
};

describe("FriendsSidebar", () => {
  it("has a handle that opens the panel, named 好友 with the count in words", () => {
    render(<FriendsSidebar overview={overview} pending={2} />);

    const handle = screen.getByRole("button", { name: "好友 （2 件待處理）" });
    expect(handle).toHaveAttribute("popovertarget", FRIENDS_PANEL_ID);
    expect(within(handle).getByText("2")).toHaveAttribute("aria-hidden", "true");

    const panel = document.getElementById(FRIENDS_PANEL_ID);
    expect(panel).toHaveAttribute("popover", "auto");
    expect(panel).toHaveAttribute("role", "dialog");
    expect(within(panel!).getByRole("heading", { level: 2, name: "好友" })).toBeInTheDocument();
    const close = within(panel!).getByRole("button", { name: "關閉" });
    expect(close).toHaveAttribute("popovertarget", FRIENDS_PANEL_ID);
    expect(close).toHaveAttribute("popovertargetaction", "hide");
    expect(within(panel!).getByRole("heading", { level: 3, name: "好友清單" })).toBeInTheDocument();
  });

  it("shows no count when nothing waits", () => {
    render(<FriendsSidebar overview={overview} pending={0} />);

    expect(screen.getByRole("button", { name: "好友" })).not.toHaveTextContent("待處理");
  });
});
