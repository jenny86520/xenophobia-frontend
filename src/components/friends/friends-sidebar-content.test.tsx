import { render, screen, within } from "@testing-library/react";
import type { FriendsOverview } from "@/types/friends";
import { FriendsSidebarContent } from "./friends-sidebar-content";

// The forms call Server Actions; rendering only needs them to exist.
jest.mock("@/app/member/actions", () => ({
  acceptMatchInviteAction: jest.fn(),
  answerFriendRequestAction: jest.fn(),
  dismissMatchInviteAction: jest.fn(),
  removeFriendAction: jest.fn(),
  sendFriendRequestAction: jest.fn(),
  updateFriendNoteAction: jest.fn(),
}));

const empty: FriendsOverview = { memberCode: "XPA-0001", friends: [], incoming: [], outgoing: [], matchInvites: [] };

const full: FriendsOverview = {
  memberCode: "XPA-0001",
  friends: [
    {
      memberId: "m2",
      nickname: "小華",
      memberCode: "XPA-0002",
      hasSteam: true,
      since: "2026-10-30T10:00:00.000Z",
      note: "大學室友",
    },
    {
      memberId: "m3",
      nickname: "小美",
      memberCode: "XPA-0003",
      hasSteam: false,
      since: "2026-10-30T10:00:00.000Z",
      note: null,
    },
  ],
  incoming: [
    {
      id: "r1",
      member: { memberId: "m4", nickname: "阿強", memberCode: "XPA-0004", hasSteam: true },
      createdAt: "2026-10-31T10:00:00.000Z",
    },
  ],
  outgoing: [
    {
      id: "r2",
      member: { memberId: "m5", nickname: "小志", memberCode: "XPA-0005", hasSteam: true },
      createdAt: "2026-10-31T10:00:00.000Z",
    },
  ],
  matchInvites: [
    {
      id: "i1",
      kind: "group",
      from: { nickname: "小華", memberCode: "XPA-0002", note: "大學室友" },
      match: { id: "x1", title: "週五內戰", status: "lobby", playerCount: 7, rosterSize: 10 },
      createdAt: "2026-10-31T11:00:00.000Z",
    },
    {
      id: "i2",
      kind: "signup",
      from: { nickname: "小美", memberCode: "XPA-0003", note: null },
      match: { id: "x2", title: "週六內戰", status: "lobby", playerCount: 2, rosterSize: 10 },
      createdAt: "2026-10-31T09:00:00.000Z",
    },
  ],
} as FriendsOverview;

const headings = () => screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent);

describe("FriendsSidebarContent", () => {
  it("puts what waits first, then the friends, the add form and the requests sent", () => {
    render(<FriendsSidebarContent overview={full} />);

    expect(headings()).toEqual(["內戰場次邀請2", "收到的好友邀請1", "好友清單2", "加好友", "送出的好友邀請1"]);

    const invites = screen.getByRole("list", { name: /內戰場次邀請/ });
    const [group, signup] = within(invites).getAllByRole("listitem");
    expect(group).toHaveTextContent("「小華」（大學室友）邀你加入小隊");
    expect(group).toHaveTextContent("報名中・7 / 10 人");
    expect(within(group).getByRole("button", { name: "加入小隊" })).toBeInTheDocument();
    expect(within(signup).getByRole("link", { name: "前往報名" })).toHaveAttribute("href", "/matches/x2");
    expect(within(signup).getByRole("button", { name: "略過" })).toBeInTheDocument();

    const incoming = screen.getByRole("list", { name: /收到的好友邀請/ });
    expect(within(incoming).getByRole("button", { name: "接受" })).toBeInTheDocument();
    expect(within(incoming).getByRole("button", { name: "拒絕" })).toBeInTheDocument();

    expect(within(screen.getByRole("list", { name: /送出的好友邀請/ })).getByRole("button", { name: "收回" })).toBeInTheDocument();

    expect(screen.getByText("XPA-0001")).toBeInTheDocument();
    expect(screen.getByLabelText(/朋友的會員編號/)).toHaveAttribute("name", "memberNumber");
  });

  it("lists each friend with a link to their page, their note and a confirmed 刪除", () => {
    render(<FriendsSidebarContent overview={full} />);

    const [hua, mei] = within(screen.getByRole("list", { name: /好友清單/ })).getAllByRole("listitem");
    expect(within(hua).getByRole("link", { name: "小華" })).toHaveAttribute("href", "/member/friends/m2");
    expect(hua).toHaveTextContent("備註：大學室友");
    expect(mei).not.toHaveTextContent("備註：");
    expect(hua).not.toHaveTextContent("尚未綁定 Steam");
    expect(mei).toHaveTextContent("尚未綁定 Steam");

    expect(within(mei).getByRole("button", { name: "刪除" })).toHaveAttribute("popovertarget", "remove-friend-m3");
    const unfriend = within(mei).getByRole("dialog", { name: "刪除好友" });
    expect(unfriend).toHaveTextContent("要刪除好友「小美」嗎？");
    expect(unfriend).toHaveTextContent("內戰場次邀請一併失效");
    expect(unfriend).toHaveTextContent("互相寫的好友備註也一併刪除");
    expect(within(unfriend).getByRole("button", { name: "確認刪除" })).toHaveAttribute("type", "submit");
    expect(within(unfriend).getByRole("button", { name: "取消" })).toHaveAttribute("type", "button");
  });

  it("leaves out the empty invite sections and says in words that there are no friends", () => {
    render(<FriendsSidebarContent overview={empty} />);

    expect(headings()).toEqual(["好友清單", "加好友"]);
    expect(screen.getByText(/目前沒有好友/)).toBeInTheDocument();
    expect(screen.getByLabelText(/朋友的會員編號/)).toBeInTheDocument();
  });
});
