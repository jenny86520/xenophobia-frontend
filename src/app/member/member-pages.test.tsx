import { render, screen, within } from "@testing-library/react";
import {
  fetchMemberFriends,
  fetchMemberPendingSummary,
  fetchMemberIceCreams,
  fetchMemberLegalChanges,
  fetchMemberMatches,
  fetchMemberPoints,
  fetchMemberProfile,
  fetchMemberVideoSubmissions,
} from "@/lib/member-session";
import type { FriendsOverview } from "@/types/friends";
import { fetchAboutContent, fetchGuide } from "@/lib/public-content-client";
import type { MemberProfile, MemberVideoSubmissions } from "@/types/member";
import { markIceCreamsSeenAction } from "./actions";
import MemberPage from "./page";
import MemberLoginPage from "./login/page";
import MemberRegisterPage from "./register/page";
import MemberPasswordPage from "./password/page";

jest.mock("@/lib/member-session", () => ({
  fetchMemberProfile: jest.fn(),
  fetchMemberVideoSubmissions: jest.fn(),
  fetchMemberMatches: jest.fn(),
  fetchMemberPoints: jest.fn(),
  fetchMemberIceCreams: jest.fn(),
  fetchMemberFriends: jest.fn(),
  fetchMemberPendingSummary: jest.fn(),
  fetchMemberLegalChanges: jest.fn(),
}));
jest.mock("@/lib/public-content-client", () => ({
  fetchAboutContent: jest.fn(),
  fetchGuide: jest.fn().mockResolvedValue(null),
}));
jest.mock("next/navigation", () => ({ useRouter: () => ({ refresh: jest.fn(), push: jest.fn() }) }));
// The forms call Server Actions; the pages only need them to exist.
jest.mock("./actions", () => ({
  loginAction: jest.fn(),
  logoutAction: jest.fn(),
  registerAction: jest.fn(),
  requestResetAction: jest.fn(),
  setPasswordAction: jest.fn(),
  updateProfileAction: jest.fn(),
  acceptLegalAction: jest.fn(),
  checkInAction: jest.fn(),
  createIceCreamAction: jest.fn(),
  giftIceCreamAction: jest.fn(),
  deleteIceCreamAction: jest.fn(),
  iceCreamStepAction: jest.fn(),
  redeemIceCreamAction: jest.fn(),
  markIceCreamsSeenAction: jest.fn(),
  registrationAction: jest.fn(),
  submitYoutubeVideoAction: jest.fn(),
  sendFriendRequestAction: jest.fn(),
  answerFriendRequestAction: jest.fn(),
  removeFriendAction: jest.fn(),
  acceptMatchInviteAction: jest.fn(),
  dismissMatchInviteAction: jest.fn(),
}));

/** Page props for /member with an optional ?tab=. */
const memberProps = (tab?: string) =>
  ({
    searchParams: Promise.resolve(tab ? { tab } : {}),
    params: Promise.resolve({}),
  }) as unknown as PageProps<"/member">;

const submissions = (overrides: Partial<MemberVideoSubmissions> = {}): MemberVideoSubmissions => ({
  paused: false,
  canSubmit: true,
  uploadsLeftToday: 5,
  items: [
    {
      id: "s2",
      game: null,
      otherGameName: "Rainbow Six",
      title: "模糊的片段",
      recordedOn: "2026-10-20",
      source: "upload",
      youtubeId: null,
      status: "rejected",
      rejectReason: "畫面太模糊",
      // 04:00Z is 12:00 in Taiwan.
      createdAt: "2026-10-21T04:00:00.000Z",
      reviewedAt: "2026-10-22T04:00:00.000Z",
    },
    {
      id: "s1",
      game: { id: "g1", name: "CS2" },
      otherGameName: "",
      title: "Ace clutch",
      recordedOn: "2026-10-01",
      source: "youtube",
      youtubeId: "dQw4w9WgXcQ",
      status: "pending",
      rejectReason: "",
      createdAt: "2026-10-02T04:00:00.000Z",
      reviewedAt: null,
    },
  ],
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
  (fetchAboutContent as jest.Mock).mockResolvedValue({ games: [{ id: "g1", name: "CS2", summary: "", videos: [] }] });
  (fetchMemberPendingSummary as jest.Mock).mockResolvedValue({ pending: 0, friends: 0, iceCreams: 0 });
});

const profile: MemberProfile = {
  name: "王小明",
  nickname: "小明",
  username: "ming",
  discordId: "ming#1234",
  memberCode: "XPA-0001",
  email: "ming@example.com",
  phone: "0912345678",
  role: { id: "r1", name: "一般會員" },
  parties: [
    {
      id: "p1",
      title: "十一月賽車",
      startDate: "2026-11-01",
      startTime: "19:00",
      endDate: "2026-11-01",
      endTime: "23:00",
      status: "active",
      registeredAt: "",
      subParties: [
        { id: "s1", title: "夜衝", startDateTime: "2026-11-01T22:00:00+08:00", endDateTime: "" },
        { id: "s2", title: "續攤", startDateTime: "", endDateTime: "" },
      ],
    },
  ],
  steam: null,
  canCreateMatch: false,
  legalConsent: {
    required: false,
    documents: [
      { key: "privacy", title: "隱私權政策", version: 1, agreedVersion: 1, required: false },
      { key: "terms", title: "使用條款", version: 2, agreedVersion: 2, required: false },
    ],
  },
};

/** The member agreed to terms version 2; version 3 asks for renewed consent. */
const renewedTerms: MemberProfile["legalConsent"] = {
  required: true,
  documents: [
    { key: "privacy", title: "隱私權政策", version: 1, agreedVersion: 1, required: false },
    { key: "terms", title: "使用條款", version: 3, agreedVersion: 2, required: true },
  ],
};

const termsChanges = {
  documents: [
    {
      key: "terms",
      title: "使用條款",
      version: 3,
      agreedVersion: 2,
      comparison: {
        fromVersion: 2,
        blocks: [{ kind: "changed", removed: [], added: [[{ text: "退出條款", change: "added" }]] }],
      },
    },
  ],
};

/** Page props for /member with any query (e.g. ?steam= from /steam/callback). */
const memberQuery = (query: Record<string, string>) =>
  ({ searchParams: Promise.resolve(query), params: Promise.resolve({}) }) as unknown as PageProps<"/member">;

describe("/member", () => {
  it("asks for renewed consent instead of showing the tabs, whatever the tab", async () => {
    (fetchMemberProfile as jest.Mock).mockResolvedValue({ ...profile, legalConsent: renewedTerms });
    (fetchMemberLegalChanges as jest.Mock).mockResolvedValue(termsChanges);
    render(await MemberPage(memberProps("friends")));

    // The header stays: nickname, sign-out and Steam row.
    expect(screen.getByRole("heading", { level: 1, name: "小明" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "登出" })).toBeInTheDocument();

    const panel = screen.getByRole("region", { name: "條款已更新" });
    // Only the document that needs consent is listed, with its version and what changed; its name opens its dialog.
    const items = within(panel).getAllByRole("listitem");
    expect(items).toHaveLength(1);
    expect(items[0]).toHaveTextContent("使用條款");
    expect(items[0]).toHaveTextContent("第 3 版");
    expect(within(items[0]).getByRole("button", { name: "使用條款" })).toHaveAttribute("popovertarget", "legal-terms");
    expect(items[0]).toHaveTextContent("與你同意的第 2 版相比");
    expect(within(items[0]).getByRole("region", { name: "使用條款的變更" })).toHaveTextContent("新增：退出條款");

    const consent = within(panel).getByRole("checkbox", { name: /我已閱讀並同意更新後的\s*使用條款/ });
    expect(consent).toBeRequired();
    expect(within(panel).queryByText(/隱私權政策/)).not.toBeInTheDocument();
    const form = consent.closest("form") as HTMLFormElement;
    expect(Object.fromEntries(new FormData(form))).toMatchObject({ termsVersion: "3", privacyVersion: "1" });
    expect(within(panel).getByRole("button", { name: "同意並繼續" })).toBeInTheDocument();

    expect(screen.queryByRole("navigation", { name: "會員專區" })).not.toBeInTheDocument();
    expect(fetchMemberFriends).not.toHaveBeenCalled();
    expect(fetchMemberPendingSummary).not.toHaveBeenCalled();
  });

  it("still lets the member read the full text and agree when the changes cannot be loaded", async () => {
    (fetchMemberProfile as jest.Mock).mockResolvedValue({ ...profile, legalConsent: renewedTerms });
    (fetchMemberLegalChanges as jest.Mock).mockResolvedValue(null);
    render(await MemberPage(memberProps()));

    const panel = screen.getByRole("region", { name: "條款已更新" });
    const [item] = within(panel).getAllByRole("listitem");
    expect(within(item).getByRole("button", { name: "使用條款" })).toHaveAttribute("popovertarget", "legal-terms");
    expect(within(panel).queryByRole("region", { name: "使用條款的變更" })).not.toBeInTheDocument();
    expect(within(panel).getByRole("button", { name: "同意並繼續" })).toBeInTheDocument();
  });

  it("names both documents when both need consent", async () => {
    (fetchMemberProfile as jest.Mock).mockResolvedValue({
      ...profile,
      legalConsent: {
        required: true,
        documents: renewedTerms.documents.map((document) => ({ ...document, agreedVersion: null, required: true })),
      },
    });
    render(await MemberPage(memberProps()));

    expect(
      screen.getByRole("checkbox", { name: /我已閱讀並同意更新後的\s*隱私權政策\s*與\s*使用條款/ }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "個人資料" })).not.toBeInTheDocument();
  });

  it("shows only how to become a member when nobody is signed in, whatever the tab", async () => {
    (fetchMemberProfile as jest.Mock).mockResolvedValue(null);
    render(await MemberPage(memberProps("videos")));

    expect(screen.getByText(/此頁僅限會員，請聯絡管理員開通/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /會員登入/ })).toHaveAttribute("href", "/member/login");
    expect(screen.getByRole("link", { name: /註冊會員/ })).toHaveAttribute("href", "/member/register");
    expect(screen.queryByText("ming@example.com")).not.toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "會員專區" })).not.toBeInTheDocument();
    expect(fetchMemberVideoSubmissions).not.toHaveBeenCalled();
  });

  it("opens the 個人資料 tab by default: the details and the 稱呼/nickname form", async () => {
    (fetchMemberProfile as jest.Mock).mockResolvedValue(profile);
    render(await MemberPage(memberProps()));
    expect(fetchMemberLegalChanges).not.toHaveBeenCalled();

    const details = screen.getByRole("region", { name: "個人資料" });
    for (const value of ["XPA-0001", "王小明", "ming", "ming#1234", "ming@example.com", "0912345678", "一般會員"]) {
      expect(within(details).getAllByText(value).length).toBeGreaterThan(0);
    }
    expect(within(details).getByLabelText("暱稱")).toHaveValue("小明");
    expect(within(details).getByLabelText("稱呼")).toHaveValue("王小明");
    const tabs = screen.getByRole("navigation", { name: "會員專區" });
    expect(
      within(tabs)
        .getAllByRole("link")
        .map((link) => [link.textContent, link.getAttribute("href")]),
    ).toEqual([
      ["個人資料", "/member"],
      ["參加的活動", "/member?tab=parties"],
      ["內戰場次", "/member?tab=matches"],
      ["好友", "/member?tab=friends"],
      ["投稿影片", "/member?tab=videos"],
      ["點數", "/member?tab=points"],
      ["冰炫風", "/member?tab=ice-creams"],
    ]);
    expect(within(tabs).getByRole("link", { name: "個人資料" })).toHaveAttribute("aria-current", "page");
    expect(within(tabs).getByRole("link", { name: "投稿影片" })).not.toHaveAttribute("aria-current");
    for (const link of within(tabs).getAllByRole("link")) {
      expect(link.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    }
    expect(screen.queryByRole("region", { name: "參加的活動" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "登出" })).toBeInTheDocument();
    expect(fetchMemberVideoSubmissions).not.toHaveBeenCalled();
  });

  it("offers to link Steam as a plain link when none is linked", async () => {
    (fetchMemberProfile as jest.Mock).mockResolvedValue(profile);
    render(await MemberPage(memberProps()));

    expect(screen.getByRole("link", { name: /綁定 Steam/ })).toHaveAttribute("href", "/steam/login?intent=link");
    expect(screen.getByText(/參加內戰需要綁定 Steam 帳號/)).toBeInTheDocument();
  });

  it("shows the linked Steam account, and that changing it is up to an admin", async () => {
    (fetchMemberProfile as jest.Mock).mockResolvedValue({
      ...profile,
      steam: {
        playerId: "p1",
        steamId: "76561198000000001",
        steamName: "Ace",
        avatarUrl: null,
        profileUrl: "https://steamcommunity.com/profiles/76561198000000001",
        linkedAt: "2026-10-25T00:00:00.000Z",
        rating: 1000,
      },
    });
    render(await MemberPage(memberQuery({ steam: "linked" })));

    expect(screen.getByText("Ace")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Steam 個人頁/ })).toHaveAttribute(
      "href",
      "https://steamcommunity.com/profiles/76561198000000001",
    );
    expect(screen.getByText("如需更換請聯絡管理員。")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("已綁定 Steam 帳號。");
    expect(screen.queryByRole("link", { name: /綁定 Steam/ })).not.toBeInTheDocument();
  });

  it("explains a refused Steam link", async () => {
    (fetchMemberProfile as jest.Mock).mockResolvedValue(profile);
    render(await MemberPage(memberQuery({ steam: "link-refused" })));

    expect(screen.getByRole("alert")).toHaveTextContent(/已被其他會員使用/);
  });

  it("falls back to 個人資料 for an unknown tab", async () => {
    (fetchMemberProfile as jest.Mock).mockResolvedValue(profile);
    render(await MemberPage(memberProps("abc")));

    expect(screen.getByRole("region", { name: "個人資料" })).toBeInTheDocument();
  });

  it("lists the joined parties on their tab", async () => {
    (fetchMemberProfile as jest.Mock).mockResolvedValue(profile);
    render(await MemberPage(memberProps("parties")));

    expect(screen.getByRole("link", { name: "參加的活動" })).toHaveAttribute("aria-current", "page");
    const joined = screen.getByRole("region", { name: "參加的活動" });
    expect(within(joined).getByRole("link", { name: "十一月賽車" })).toHaveAttribute("href", "/party/p1");
    expect(joined).toHaveTextContent("2026-11-01 19:00 – 23:00");
    const subParties = within(joined).getByRole("list", { name: "「十一月賽車」報名的子派對" });
    expect(
      within(subParties)
        .getAllByRole("listitem")
        .map((item) => item.textContent),
    ).toEqual(["子派對：夜衝11/01 22:00", "子派對：續攤待定"]);
    expect(screen.queryByLabelText("暱稱")).not.toBeInTheDocument();
  });

  it("offers 建立內戰場次 beside the Steam account only to members who may create scrims", async () => {
    (fetchMemberProfile as jest.Mock).mockResolvedValue({ ...profile, canCreateMatch: true });
    const { unmount } = render(await MemberPage(memberProps()));
    expect(screen.getByRole("link", { name: /建立內戰場次/ })).toHaveAttribute("href", "/matches/new");
    // A primary (filled) button, not a plain link.
    expect(screen.getByRole("link", { name: /建立內戰場次/ })).toHaveClass("cta-primary");
    unmount();

    (fetchMemberProfile as jest.Mock).mockResolvedValue(profile);
    render(await MemberPage(memberProps()));
    expect(screen.queryByRole("link", { name: /建立內戰場次/ })).not.toBeInTheDocument();
  });

  it("says when the member has not joined anything yet", async () => {
    (fetchMemberProfile as jest.Mock).mockResolvedValue({ ...profile, parties: [] });
    render(await MemberPage(memberProps("parties")));

    expect(screen.getByText(/還沒有報名任何活動/)).toBeInTheDocument();
  });

  it("lists the member's scrims with their rating and team, and links to every match", async () => {
    (fetchMemberProfile as jest.Mock).mockResolvedValue(profile);
    (fetchMemberMatches as jest.Mock).mockResolvedValue({
      steamLinked: true,
      rating: 1234,
      items: [
        {
          id: "m1",
          title: "週五晚場",
          status: "teams_confirmed",
          game: { id: "cs2", name: "Counter-Strike 2" },
          party: null,
          playerCount: 10,
          capacity: 10,
          createdAt: "2026-10-25T00:00:00.000Z",
          createdBy: "小華",
          team: "A",
          isCaptain: true,
          ratingChange: { delta: 28, teamPart: 25, personalPart: 3, note: null },
        },
      ],
      adjustments: [{ before: 1206, after: 1234, delta: 28, at: "2026-11-07T04:00:00.000Z" }],
    });
    render(await MemberPage(memberProps("matches")));

    const panel = screen.getByRole("region", { name: "內戰場次" });
    // The rating sits in the left column, under the heading.
    const heading = within(panel).getByRole("heading", { level: 2, name: "內戰場次" });
    expect(heading.parentElement).toContainElement(within(panel).getByText("1234"));
    const row = within(panel).getByRole("link", { name: /週五晚場/ });
    expect(row).toHaveAttribute("href", "/matches/m1");
    expect(within(row).getByText("A 隊・隊長・評分 +28")).toBeInTheDocument();
    expect(within(row).getByText("小華・2026/10/25 08:00")).toBeInTheDocument();
    expect(within(panel).getByRole("link", { name: "查看所有內戰場次" })).toHaveAttribute("href", "/matches");
    expect(within(panel).getByRole("link", { name: "評分排行" })).toHaveAttribute("href", "/games/cs2");
    // Admins' adjustments are listed apart.
    expect(within(panel).getByRole("list", { name: "管理員調整" })).toHaveTextContent("+281206 → 1234");
  });

  it("asks a member without Steam to link it before scrims", async () => {
    (fetchMemberProfile as jest.Mock).mockResolvedValue(profile);
    (fetchMemberMatches as jest.Mock).mockResolvedValue({
      steamLinked: false,
      rating: null,
      items: [],
      adjustments: [],
    });
    render(await MemberPage(memberProps("matches")));

    const panel = screen.getByRole("region", { name: "內戰場次" });
    expect(panel).toHaveTextContent("參加內戰與評分需要先綁定 Steam 帳號");
    expect(within(panel).getByRole("link", { name: "查看所有內戰場次" })).toBeInTheDocument();
  });

  describe("好友 tab", () => {
    const overview: FriendsOverview = {
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
      outgoing: [],
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
    };

    it("lists the friends first, then the member's number, the add form, invites and requests beside them", async () => {
      (fetchMemberProfile as jest.Mock).mockResolvedValue(profile);
      (fetchMemberFriends as jest.Mock).mockResolvedValue(overview);
      (fetchMemberPendingSummary as jest.Mock).mockResolvedValue({ pending: 5, friends: 3, iceCreams: 2 });
      render(await MemberPage(memberProps("friends")));

      // Each tab counts only its own items (the header shows all 5).
      const tab = screen.getByRole("link", { name: /好友/ });
      expect(tab).toHaveAttribute("aria-current", "page");
      expect(tab).toHaveTextContent("（3 件待處理）");
      expect(screen.getByRole("link", { name: /冰炫風/ })).toHaveTextContent("（2 件待處理）");

      const panel = screen.getByRole("region", { name: "好友" });
      expect(within(panel).getByText("XPA-0001")).toBeInTheDocument();
      expect(within(panel).getByLabelText(/朋友的會員編號/)).toHaveAttribute("name", "memberNumber");
      expect(
        within(panel)
          .getAllByRole("heading", { level: 3 })
          .map((h) => h.textContent),
        // 好友清單 is for screen readers only (no visible title or count).
      ).toEqual(["好友清單", "內戰場次邀請2", "收到的好友邀請1", "送出的好友邀請"]);

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
      expect(screen.getByText("沒有等待回覆的邀請。")).toBeInTheDocument();

      expect(screen.getByRole("heading", { name: "好友清單" })).toHaveClass("sr-only");
      const friends = screen.getByRole("list", { name: "好友清單" });
      const [hua, mei] = within(friends).getAllByRole("listitem");
      // Each nickname opens the friend's page; the member's own note follows it.
      expect(within(hua).getByRole("link", { name: "小華" })).toHaveAttribute("href", "/member/friends/m2");
      expect(hua).toHaveTextContent("備註：大學室友");
      expect(mei).not.toHaveTextContent("備註");
      expect(hua).not.toHaveTextContent("尚未綁定 Steam");
      expect(mei).toHaveTextContent("尚未綁定 Steam");
      expect(within(mei).getByRole("checkbox", { name: /確認刪除好友「小美」/ })).toBeRequired();
      expect(fetchMemberVideoSubmissions).not.toHaveBeenCalled();
    });

    it("says in words when there is nothing yet", async () => {
      (fetchMemberProfile as jest.Mock).mockResolvedValue(profile);
      (fetchMemberFriends as jest.Mock).mockResolvedValue({
        memberCode: "XPA-0001",
        friends: [],
        incoming: [],
        outgoing: [],
        matchInvites: [],
      });
      render(await MemberPage(memberProps("friends")));

      expect(screen.getByRole("link", { name: "好友" })).not.toHaveTextContent("待處理");
      for (const text of ["目前沒有內戰場次邀請。", "沒有收到好友邀請。", "沒有等待回覆的邀請。"]) {
        expect(screen.getByText(text)).toBeInTheDocument();
      }
      expect(screen.getByText(/目前沒有好友/)).toBeInTheDocument();
    });
  });

  describe("點數 tab", () => {
    const points = (overrides: Record<string, unknown> = {}) => ({
      balance: 7,
      checkedInToday: false,
      campaign: { id: "c1", title: "十一月全勤", endDate: "2026-11-30", requiredDays: 10, streak: 6 },
      entries: {
        items: [
          // 04:00Z is 12:00 in Taiwan.
          { id: "e2", amount: 1, kind: "streak_bonus", createdAt: "2026-11-06T04:00:00.000Z" },
          { id: "e1", amount: 1, kind: "checkin", createdAt: "2026-11-06T04:00:00.000Z" },
          { id: "e0", amount: -3, kind: "future_kind", createdAt: "2026-11-05T04:00:00.000Z" },
        ],
        total: 3,
        page: 1,
        pageSize: 20,
      },
      ...overrides,
    });

    it("shows the balance, the check-in button, the campaign's stamp card and the entries", async () => {
      (fetchMemberProfile as jest.Mock).mockResolvedValue(profile);
      (fetchMemberPoints as jest.Mock).mockResolvedValue(points());
      render(await MemberPage(memberProps("points")));

      expect(screen.getByRole("link", { name: "點數" })).toHaveAttribute("aria-current", "page");
      expect(fetchMemberPoints).toHaveBeenCalledWith(1);
      expect(screen.getByText("7", { selector: "p" })).toHaveTextContent("7點");
      expect(screen.getByRole("button", { name: "簽到 +1" })).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "十一月全勤" })).toBeInTheDocument();
      expect(screen.getByText("6 / 10 天・再 4 天 +1")).toBeInTheDocument();
      expect(document.querySelectorAll("#stamp-card li[data-stamped]")).toHaveLength(6);
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
      // The check-in guide is not published here, so there is no 「怎麼玩？」.
      expect(fetchGuide).toHaveBeenCalledWith("checkin");
      expect(screen.queryByRole("button", { name: "怎麼玩？" })).not.toBeInTheDocument();

      const rows = within(screen.getByRole("region", { name: "點數紀錄" })).getAllByRole("listitem");
      expect(rows.map((row) => row.textContent)).toEqual([
        "連續簽到獎勵2026/11/06 12:00+1",
        "每日簽到2026/11/06 12:00+1",
        // A kind the site does not know yet shows its code.
        "future_kind2026/11/05 12:00−3",
      ]);
    });

    it("puts the check-in guide's 「怎麼玩？」 beside the heading once it is published", async () => {
      (fetchMemberProfile as jest.Mock).mockResolvedValue(profile);
      (fetchMemberPoints as jest.Mock).mockResolvedValue(points());
      (fetchGuide as jest.Mock).mockResolvedValueOnce({
        ref: "checkin",
        title: "每日簽到",
        content: "每天按一次。",
        imageUrl: null,
        imageAlt: "每日簽到",
        video: null,
      });
      render(await MemberPage(memberProps("points")));

      const heading = screen.getByRole("heading", { level: 2, name: "點數" });
      expect(
        within(heading.parentElement as HTMLElement).getByRole("button", { name: "怎麼玩？" }),
      ).toBeInTheDocument();
    });

    it("says today is done and leaves out the campaign when none is running", async () => {
      (fetchMemberProfile as jest.Mock).mockResolvedValue(profile);
      (fetchMemberPoints as jest.Mock).mockResolvedValue(points({ checkedInToday: true, campaign: null }));
      render(await MemberPage(memberProps("points")));

      expect(screen.getByText("今天已簽到")).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "簽到 +1" })).not.toBeInTheDocument();
      expect(document.querySelector("#stamp-card")).toBeNull();
    });

    it("pages the entries", async () => {
      (fetchMemberProfile as jest.Mock).mockResolvedValue(profile);
      (fetchMemberPoints as jest.Mock).mockResolvedValue(
        points({ entries: { items: [], total: 45, page: 2, pageSize: 20 } }),
      );
      render(
        await MemberPage({
          searchParams: Promise.resolve({ tab: "points", page: "2" }),
          params: Promise.resolve({}),
        } as unknown as PageProps<"/member">),
      );

      expect(fetchMemberPoints).toHaveBeenCalledWith(2);
      expect(screen.getByRole("link", { name: "較新的紀錄" })).toHaveAttribute("href", "/member?tab=points");
      expect(screen.getByRole("link", { name: "較早的紀錄" })).toHaveAttribute("href", "/member?tab=points&page=3");
    });

    it("opens the stamp card named by ?card= and ignores one that is not a number", async () => {
      (fetchMemberProfile as jest.Mock).mockResolvedValue(profile);
      const long = { id: "c1", title: "全年全勤", endDate: "2026-12-31", requiredDays: 60, streak: 23 };
      (fetchMemberPoints as jest.Mock).mockResolvedValue(points({ campaign: long }));
      const open = async (card: string) =>
        render(
          await MemberPage({
            searchParams: Promise.resolve({ tab: "points", card }),
            params: Promise.resolve({}),
          } as unknown as PageProps<"/member">),
        );

      const first = await open("2");
      expect(screen.getByRole("navigation", { name: "集點卡分頁" })).toHaveTextContent("第 2 / 6 張");
      first.unmount();

      await open("abc");
      expect(screen.getByRole("navigation", { name: "集點卡分頁" })).toHaveTextContent("第 3 / 6 張");
    });
  });

  describe("冰炫風 tab", () => {
    const token = (serial: number, overrides: Record<string, unknown> = {}) => ({
      id: `i${serial}`,
      serial,
      origin: "member",
      status: "held",
      issuer: { nickname: "小明" },
      holder: { nickname: "小明" },
      giftTo: null,
      giftExpiresAt: null,
      confirmExpiresAt: null,
      disputed: false,
      createdAt: "2026-11-06T04:00:00.000Z",
      endedAt: null,
      actions: [],
      isNew: false,
      events: [
        {
          id: `e${serial}`,
          serial,
          iceCreamId: `i${serial}`,
          type: "created",
          actor: { nickname: "小明" },
          target: null,
          note: "",
          createdAt: "2026-11-06T04:00:00.000Z",
        },
      ],
      ...overrides,
    });
    const iceCreams = (overrides: Record<string, unknown> = {}) => ({
      issuing: { active: 2, limit: 10 },
      balance: 5,
      createCost: 3,
      create: { allowed: true, reason: null },
      held: [
        token(12, { actions: ["gift", "delete"] }),
        token(3, { issuer: { nickname: "管理員" }, actions: ["gift", "requestRedeem"] }),
        token(14, {
          status: "gifting",
          giftTo: { nickname: "小華" },
          // 04:00Z is 12:00 in Taiwan.
          giftExpiresAt: "2026-11-08T04:00:00.000Z",
        }),
      ],
      incoming: [
        token(20, { issuer: { nickname: "小華" }, holder: { nickname: "小華" }, actions: ["accept", "decline"] }),
      ],
      redeemRequests: [token(9, { holder: { nickname: "小美" }, status: "redeeming", actions: ["redeem"] })],
      toConfirm: [],
      friends: [{ memberId: "hua", nickname: "小華" }],
      ...overrides,
    });

    it("shows issuing, held tokens with their actions, gifts to accept and redemptions to complete", async () => {
      (fetchMemberProfile as jest.Mock).mockResolvedValue(profile);
      (fetchMemberIceCreams as jest.Mock).mockResolvedValue(iceCreams());
      render(await MemberPage(memberProps("ice-creams")));

      expect(screen.getByRole("link", { name: "冰炫風" })).toHaveAttribute("aria-current", "page");
      expect(screen.getByText("已發出 2 / 10 支")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "建立冰炫風（3 點）" })).toBeInTheDocument();

      const held = screen.getByRole("list", { name: "我的冰庫裡的冰炫風" });
      const cards = Array.from(held.children) as HTMLElement[];
      expect(cards[0]).toHaveTextContent("冰炫風 #12小明 發行在你手上");
      // Giving and deleting open dialogs; the forms live inside them.
      expect(within(cards[0]).getByRole("button", { name: "贈送" })).toHaveAttribute("popovertarget", "ice-gift-i12");
      const gift = within(cards[0]).getByRole("dialog", { name: "贈送冰炫風 #12" });
      expect(within(gift).getByRole("form", { name: "把冰炫風 #12送給好友" })).toBeInTheDocument();
      expect(within(gift).getByRole("option", { name: "小華" })).toBeInTheDocument();
      expect(within(cards[0]).getByRole("button", { name: "刪除" })).toHaveAttribute("popovertarget", "ice-delete-i12");
      expect(
        within(within(cards[0]).getByRole("dialog", { name: "刪除冰炫風 #12" })).getByLabelText(
          "確認刪除冰炫風 #12（點數不退）",
        ),
      ).toBeInTheDocument();
      expect(within(cards[0]).queryByRole("button", { name: "兌換" })).not.toBeInTheDocument();
      // Redeeming asks again, naming the issuer.
      expect(within(cards[1]).getByText("管理員 發行")).toBeInTheDocument();
      expect(within(cards[1]).getByRole("button", { name: "兌換" })).toHaveAttribute("popovertarget", "ice-redeem-i3");
      const redeem = within(cards[1]).getByRole("dialog", { name: "兌換冰炫風 #3" });
      expect(redeem).toHaveTextContent("要向「管理員」申請兌換冰炫風 #3嗎？");
      expect(within(redeem).getByRole("button", { name: "確認申請" })).toBeInTheDocument();
      expect(cards[2]).toHaveTextContent("贈送中：正飛去「小華」那裡");
      expect(cards[2]).toHaveTextContent("2026/11/08 12:00 前沒被收下就會飛回來");
      // Every card carries the hidden ice cream icon.
      expect(cards[0].querySelector("svg")).toHaveAttribute("aria-hidden", "true");

      // Clicking a held card (not its buttons) opens the token's life.
      expect(within(cards[0]).getByRole("button", { name: /冰炫風 #12/ })).toHaveAttribute(
        "popovertarget",
        "ice-detail-i12",
      );
      expect(within(cards[0]).getByRole("dialog", { name: "冰炫風 #12" })).toHaveTextContent("小明 建立了這支冰炫風");

      // The right column is cards too, in a lighter voice.
      const incoming = within(screen.getByRole("region", { name: "有人塞冰給你" })).getByRole("list", {
        name: "等你收下的冰炫風",
      });
      const present = Array.from(incoming.children)[0] as HTMLElement;
      expect(present).toHaveTextContent("「小華」塞給你的");
      expect(within(present).getByRole("button", { name: /冰炫風 #20/ })).toHaveAttribute(
        "popovertarget",
        "ice-detail-i20",
      );
      expect(within(present).getByRole("button", { name: "收下" })).toBeInTheDocument();
      expect(within(present).getByRole("button", { name: "退回去" })).toBeInTheDocument();
      const requests = within(screen.getByRole("region", { name: "有人來討冰了" })).getByRole("list", {
        name: "等你兌現的冰炫風",
      });
      expect(requests).toHaveTextContent("「小美」拿著它來討了");
      expect(within(requests).getByRole("button", { name: "給 3 點" })).toBeInTheDocument();
      expect(within(requests).getByRole("button", { name: "請吃一支" })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "冰炫風成長史冊" })).toHaveAttribute("href", "/ice-creams");
      expect(screen.getByRole("link", { name: "點數商店" })).toHaveAttribute("href", "/shop");
      // Nothing new, so nothing is marked as seen.
      expect(screen.queryByText("新")).not.toBeInTheDocument();
      expect(markIceCreamsSeenAction).not.toHaveBeenCalled();
    });

    it("marks tokens from the admins as new and tells the backend they were seen", async () => {
      (fetchMemberProfile as jest.Mock).mockResolvedValue(profile);
      (fetchMemberIceCreams as jest.Mock).mockResolvedValue(
        iceCreams({ held: [token(3, { issuer: { nickname: "管理員" }, isNew: true }), token(12)] }),
      );
      render(await MemberPage(memberProps("ice-creams")));

      const rows = Array.from(screen.getByRole("list", { name: "我的冰庫裡的冰炫風" }).children) as HTMLElement[];
      expect(within(rows[0]).getByText("新")).toBeInTheDocument();
      expect(within(rows[1]).queryByText("新")).not.toBeInTheDocument();
      expect(markIceCreamsSeenAction).toHaveBeenCalledTimes(1);
    });

    it("explains empty blocks and why a token cannot be issued", async () => {
      (fetchMemberProfile as jest.Mock).mockResolvedValue(profile);
      (fetchMemberIceCreams as jest.Mock).mockResolvedValue(
        iceCreams({
          held: [],
          incoming: [],
          redeemRequests: [],
          create: { allowed: false, reason: "點數不足，建立冰炫風需要 3 點" },
        }),
      );
      render(await MemberPage(memberProps("ice-creams")));

      expect(screen.getByText("點數不足，建立冰炫風需要 3 點")).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /建立冰炫風/ })).not.toBeInTheDocument();
      expect(screen.getByText("冰庫空空的，自己發一支，或等朋友塞冰給你。")).toBeInTheDocument();
      expect(screen.getByText("還沒有人塞冰炫風給你，先去多交幾個朋友吧。")).toBeInTheDocument();
      expect(screen.getByText("目前沒人來討冰，荷包很安全。")).toBeInTheDocument();
      expect(screen.getByText("沒有等你驗收的冰，嘴巴先休息一下。")).toBeInTheDocument();
    });

    it("asks again before a physical redemption and warns against claiming one never bought", async () => {
      (fetchMemberProfile as jest.Mock).mockResolvedValue(profile);
      (fetchMemberIceCreams as jest.Mock).mockResolvedValue(iceCreams());
      render(await MemberPage(memberProps("ice-creams")));

      const requests = within(screen.getByRole("region", { name: "有人來討冰了" })).getByRole("list", {
        name: "等你兌現的冰炫風",
      });
      // 請吃一支 only opens the dialog; the submit lives inside it.
      expect(within(requests).getByRole("button", { name: "請吃一支" })).toHaveAttribute(
        "popovertarget",
        "ice-treat-i9",
      );
      const treat = within(requests).getByRole("dialog", { name: "請吃一支" });
      expect(treat).toHaveTextContent("真的要請「小美」吃一支冰炫風 #9嗎？");
      // What follows is short keyed lines, the warning a framed line of its own.
      const after = treat.querySelector("dl") as HTMLElement;
      expect(after).toHaveAccessibleName("請吃一支之後");
      expect(
        within(after)
          .getAllByRole("term")
          .map((t) => t.textContent),
      ).toEqual(["驗收", "沒吃到", "還沒買"]);
      expect(after).toHaveTextContent("先按「給 3 點」最安全。");
      expect(treat).toHaveTextContent("冰炫風之神在看著你：還沒請就按，是詐騙行為。");
      expect(within(treat).getByRole("button", { name: "我請了，等對方驗收" })).toHaveAttribute("type", "submit");
      expect(within(treat).getByRole("button", { name: "再等等" })).toHaveAttribute("popovertargetaction", "hide");

      // Asking to redeem explains the confirmation that follows a physical one.
      const ask = screen.getByRole("dialog", { name: "兌換冰炫風 #3" });
      const ways = ask.querySelector("dl") as HTMLElement;
      expect(ways).toHaveAccessibleName("對方會選一種方式兌現");
      expect(
        within(ways)
          .getAllByRole("term")
          .map((t) => t.textContent),
      ).toEqual(["給 3 點", "請吃一支", "反悔"]);
      expect(ways).toHaveTextContent("72 小時沒回應，就當你吃得很滿足。");
    });

    it("lets the holder confirm or, after asking again, dispute a physical redemption", async () => {
      (fetchMemberProfile as jest.Mock).mockResolvedValue(profile);
      (fetchMemberIceCreams as jest.Mock).mockResolvedValue(
        iceCreams({
          toConfirm: [
            token(15, {
              status: "confirming",
              holder: { nickname: "小明" },
              issuer: { nickname: "阿明" },
              // 06:30Z is 14:30 in Taiwan.
              confirmExpiresAt: "2026-11-15T06:30:00.000Z",
              actions: ["confirmPhysical", "disputePhysical"],
            }),
          ],
        }),
      );
      render(await MemberPage(memberProps("ice-creams")));

      const list = within(screen.getByRole("region", { name: "冰送到了嗎？" })).getByRole("list", {
        name: "等你驗收的冰炫風",
      });
      expect(list).toHaveTextContent("「阿明」說已經請你吃了");
      expect(list).toHaveTextContent("2026/11/15 14:30 前沒回應，就當你吃到了");
      expect(within(list).getByRole("button", { name: "確認吃到了" })).toHaveAttribute("type", "submit");
      expect(within(list).getByRole("button", { name: "我沒吃到啊" })).toHaveAttribute(
        "popovertarget",
        "ice-dispute-i15",
      );
      const dispute = within(list).getByRole("dialog", { name: "確定沒吃到嗎？" });
      expect(dispute).toHaveTextContent("吃了說沒吃，冰炫風之神一樣看得到。");
      expect(within(dispute).getByRole("button", { name: "真的沒吃到" })).toHaveAttribute("type", "submit");
      expect(within(dispute).getByRole("button", { name: "啊我吃到了" })).toHaveAttribute(
        "popovertargetaction",
        "hide",
      );
    });

    it("shows the issuer a claimed redemption waiting, and warns after the holder said they never got it", async () => {
      (fetchMemberProfile as jest.Mock).mockResolvedValue(profile);
      (fetchMemberIceCreams as jest.Mock).mockResolvedValue(
        iceCreams({
          redeemRequests: [
            token(9, {
              holder: { nickname: "小美" },
              status: "confirming",
              confirmExpiresAt: "2026-11-15T06:30:00.000Z",
            }),
            token(10, { holder: { nickname: "小華" }, status: "redeeming", disputed: true, actions: ["redeem"] }),
          ],
        }),
      );
      render(await MemberPage(memberProps("ice-creams")));

      const cards = Array.from(screen.getByRole("list", { name: "等你兌現的冰炫風" }).children) as HTMLElement[];
      expect(cards[0]).toHaveTextContent("等「小美」驗收");
      expect(cards[0]).toHaveTextContent("2026/11/15 14:30 前沒回應就算吃到了");
      expect(within(cards[0]).queryByRole("button", { name: "給 3 點" })).not.toBeInTheDocument();
      expect(within(cards[0]).queryByRole("button", { name: "請吃一支" })).not.toBeInTheDocument();
      expect(cards[1]).toHaveTextContent("「小華」說還沒吃到！不准詐騙喔。重新請一支，或乾脆給 3 點了事。");
      expect(within(cards[1]).getByRole("button", { name: "給 3 點" })).toBeInTheDocument();
    });
  });

  describe("投稿影片 tab", () => {
    it("explains the review, the YouTube channel and the limits above both forms", async () => {
      (fetchMemberProfile as jest.Mock).mockResolvedValue(profile);
      (fetchMemberVideoSubmissions as jest.Mock).mockResolvedValue(submissions());
      render(await MemberPage(memberProps("videos")));

      expect(screen.getByRole("link", { name: "投稿影片" })).toHaveAttribute("aria-current", "page");
      expect(
        screen.getByText(
          "為遊戲項目投稿你的 highlight 影片。投稿需經管理員審核，通過後會公開在網站上，並陸續上傳至官網 YouTube 頻道。",
        ),
      ).toBeInTheDocument();
      // The upload limits sit under the file field, where they apply.
      expect(screen.getByLabelText("影片檔")).toHaveAccessibleDescription(
        "MP4 或 WebM，500 MB 以內；每天最多 5 部，今天還能上傳 5 部。",
      );
      expect(screen.getByRole("form", { name: "以 YouTube 連結投稿" })).toBeInTheDocument();
      expect(screen.getByRole("form", { name: "上傳影片檔投稿" })).toBeInTheDocument();
      // Where the video is comes first: each form opens with its source field.
      for (const [form, first] of [
        ["以 YouTube 連結投稿", "youtube-url"],
        ["上傳影片檔投稿", "upload-file"],
      ]) {
        expect(screen.getByRole("form", { name: form }).querySelector("input, select")).toHaveAttribute("id", first);
      }
    });

    it("points a member with Steam to their own Leetify page to find highlights", async () => {
      (fetchMemberProfile as jest.Mock).mockResolvedValue({
        ...profile,
        steam: {
          playerId: "p1",
          steamId: "76561198000000001",
          steamName: "Ace",
          avatarUrl: null,
          profileUrl: "https://steamcommunity.com/profiles/76561198000000001",
          linkedAt: "2026-10-25T00:00:00.000Z",
          rating: 1000,
        },
      });
      (fetchMemberVideoSubmissions as jest.Mock).mockResolvedValue(submissions());
      render(await MemberPage(memberProps("videos")));

      // A button opens the guide as a popover dialog.
      expect(screen.getByRole("button", { name: "從 Leetify 找片段" })).toHaveAttribute(
        "popovertarget",
        "leetify-guide",
      );
      const guide = screen.getByRole("dialog", { name: "從 Leetify 找你的精彩片段", hidden: true });
      const link = within(guide).getByRole("link", { name: /開啟我的 Leetify 頁面/, hidden: true });
      expect(link).toHaveAttribute("href", "https://leetify.com/app/profile/76561198000000001");
      expect(link).toHaveAttribute("target", "_blank");
      expect(
        within(guide)
          .getAllByRole("listitem", { hidden: true })
          .map((item) => item.textContent),
      ).toEqual([
        expect.stringContaining("到 Leetify 打開你的精彩片段"),
        "在片段頁下載影片，或分享到 YouTube 後複製連結。",
        "回到投稿表單，上傳影片檔或貼上 YouTube 連結。",
      ]);
      expect(within(guide).queryByText(/綁定 Steam 後/)).not.toBeInTheDocument();
    });

    it("still guides a member without Steam, to Leetify's front page", async () => {
      (fetchMemberProfile as jest.Mock).mockResolvedValue(profile);
      (fetchMemberVideoSubmissions as jest.Mock).mockResolvedValue(submissions());
      render(await MemberPage(memberProps("videos")));

      const guide = screen.getByRole("dialog", { name: "從 Leetify 找你的精彩片段", hidden: true });
      expect(within(guide).getByRole("link", { name: /前往 Leetify/, hidden: true })).toHaveAttribute(
        "href",
        "https://leetify.com",
      );
      expect(guide).toHaveTextContent("綁定 Steam 後，這裡會直接連到你的 Leetify 頁面。");
    });

    it("lists the member's submissions with status text and the rejection reason", async () => {
      (fetchMemberProfile as jest.Mock).mockResolvedValue(profile);
      (fetchMemberVideoSubmissions as jest.Mock).mockResolvedValue(submissions());
      render(await MemberPage(memberProps("videos")));

      const rows = within(screen.getByRole("region", { name: "投稿紀錄" })).getAllByRole("listitem");
      expect(rows).toHaveLength(2);
      expect(rows[0]).toHaveTextContent("模糊的片段");
      expect(rows[0]).toHaveTextContent("其他：Rainbow Six");
      expect(rows[0]).toHaveTextContent("已退回");
      expect(rows[0]).toHaveTextContent("退回原因：畫面太模糊");
      expect(rows[0]).toHaveTextContent("投稿 2026/10/21 12:00");
      expect(rows[1]).toHaveTextContent("待審核");
      expect(rows[1]).toHaveTextContent("YouTube 連結");
      expect(rows[1]).not.toHaveTextContent("退回原因");
    });

    it("puts the forms in the main column and the history in the side column", async () => {
      (fetchMemberProfile as jest.Mock).mockResolvedValue(profile);
      (fetchMemberVideoSubmissions as jest.Mock).mockResolvedValue(submissions());
      render(await MemberPage(memberProps("videos")));

      const history = screen.getByRole("region", { name: "投稿紀錄" });
      const form = screen.getByRole("form", { name: "以 YouTube 連結投稿" });
      expect(history.parentElement).toHaveClass("lg:col-start-8");
      expect(history.parentElement).not.toContainElement(form);
    });

    it("shows a member without the permission why there is no form, but still their history", async () => {
      (fetchMemberProfile as jest.Mock).mockResolvedValue(profile);
      (fetchMemberVideoSubmissions as jest.Mock).mockResolvedValue(submissions({ canSubmit: false }));
      render(await MemberPage(memberProps("videos")));

      expect(screen.getByText(/目前的角色不能投稿影片/)).toBeInTheDocument();
      expect(screen.queryByRole("form", { name: "以 YouTube 連結投稿" })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "從 Leetify 找片段" })).not.toBeInTheDocument();
      expect(within(screen.getByRole("region", { name: "投稿紀錄" })).getAllByRole("listitem")).toHaveLength(2);
      expect(fetchAboutContent).not.toHaveBeenCalled();
    });

    it("says submissions are paused, with no form but the history kept", async () => {
      (fetchMemberProfile as jest.Mock).mockResolvedValue(profile);
      (fetchMemberVideoSubmissions as jest.Mock).mockResolvedValue(submissions({ paused: true, canSubmit: false }));
      render(await MemberPage(memberProps("videos")));

      expect(screen.getByText("影片投稿目前暫停，恢復後即可投稿。")).toBeInTheDocument();
      expect(screen.queryByText(/目前的角色不能投稿影片/)).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "從 Leetify 找片段" })).not.toBeInTheDocument();
      expect(screen.queryByRole("form", { name: "以 YouTube 連結投稿" })).not.toBeInTheDocument();
      expect(within(screen.getByRole("region", { name: "投稿紀錄" })).getAllByRole("listitem")).toHaveLength(2);
    });

    it("says so when nothing has been submitted yet", async () => {
      (fetchMemberProfile as jest.Mock).mockResolvedValue(profile);
      (fetchMemberVideoSubmissions as jest.Mock).mockResolvedValue(submissions({ items: [] }));
      render(await MemberPage(memberProps("videos")));

      expect(screen.getByText("還沒有投稿。")).toBeInTheDocument();
    });
  });
});

describe("/member/login", () => {
  const loginProps = (steam?: string, via?: string) =>
    ({
      searchParams: Promise.resolve({ ...(steam ? { steam } : {}), ...(via ? { via } : {}) }),
      params: Promise.resolve({}),
    }) as unknown as PageProps<"/member/login">;

  it("warns about the three-attempt lock and offers a reset request", async () => {
    render(await MemberLoginPage(loginProps()));

    expect(screen.getByRole("note")).toHaveTextContent("密碼連續輸入錯誤三次，帳號會被鎖定，需聯絡管理員解鎖");
    expect(screen.getByRole("button", { name: "登入" }).querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByRole("button", { name: "申請重設密碼" })).toBeInTheDocument();
    expect(screen.getByText(/每個帳號一天只能申請一次/)).toBeInTheDocument();
  });

  it("offers guests a Steam sign-in as a plain link to /steam/login", async () => {
    render(await MemberLoginPage(loginProps()));

    expect(screen.getByRole("heading", { name: "訪客以 Steam 登入" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "以 Steam 登入" })).toHaveAttribute("href", "/steam/login?intent=guest");
    expect(screen.getByRole("link", { name: "以 Steam 登入" }).querySelector("svg[data-icon=steam]")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("explains why a Steam sign-in did not finish, and ignores unknown codes", async () => {
    render(await MemberLoginPage(loginProps("disabled")));
    expect(screen.getByRole("alert")).toHaveTextContent("這個訪客帳號已被停用，請聯絡管理員。");

    render(await MemberLoginPage(loginProps("<script>")));
    expect(screen.getAllByRole("alert")).toHaveLength(1);
  });

  it("offers members whose Steam is linked a Steam sign-in in the login area", async () => {
    render(await MemberLoginPage(loginProps()));

    const loginArea = screen.getByRole("region", { name: "登入" });
    expect(within(loginArea).getByRole("link", { name: "以 Steam 登入會員" })).toHaveAttribute(
      "href",
      "/steam/login?intent=member",
    );
    expect(screen.getByRole("region", { name: "訪客以 Steam 登入" })).toHaveTextContent("以 Steam 登入會員");
  });

  it("shows a member Steam sign-in error in the login area, not the guest one", async () => {
    render(await MemberLoginPage(loginProps("not-linked", "member")));

    const alert = within(screen.getByRole("region", { name: "登入" })).getByRole("alert");
    expect(alert).toHaveTextContent("這個 Steam 帳號還沒綁定會員。請先用帳號密碼登入，再到會員頁綁定 Steam。");
    expect(within(screen.getByRole("region", { name: "訪客以 Steam 登入" })).queryByRole("alert")).toBeNull();
  });
});

describe("/member/register", () => {
  it("explains that an admin must activate the account, and asks for no password", () => {
    render(<MemberRegisterPage />);

    expect(screen.getByText(/註冊後需聯絡管理員開通/)).toBeInTheDocument();
    // 稱呼 is only for admins to tell sign-ups apart: no real name, and no autofill of one.
    expect(screen.getByLabelText("稱呼")).toHaveAccessibleDescription("讓管理員辨識你，不必填真名。");
    expect(screen.getByLabelText("稱呼")).toHaveAttribute("autocomplete", "off");
    for (const label of ["稱呼", "暱稱", "帳號", "Discord ID", "Email"]) {
      expect(screen.getByLabelText(label)).toBeRequired();
      expect(screen.getByLabelText(label).closest("div")).toHaveTextContent("必填");
    }
    expect(screen.getByLabelText("手機")).not.toBeRequired();
    expect(screen.getByLabelText("手機").closest("div")).toHaveTextContent("選填");
    expect(document.querySelector('input[type="password"]')).toBeNull();

    const consent = screen.getByRole("checkbox", { name: /我已閱讀並同意\s*使用條款\s*與\s*隱私權政策/ });
    expect(consent).toBeRequired();
    expect(consent).toHaveAttribute("name", "acceptTerms");
    expect(consent.closest("div")).toHaveTextContent("必填");
    expect(screen.getByRole("button", { name: "使用條款" })).toHaveAttribute("popovertarget", "legal-terms");
    expect(screen.getByRole("button", { name: "隱私權政策" })).toHaveAttribute("popovertarget", "legal-privacy");
  });
});

describe("/member/password", () => {
  const props = (token?: string) =>
    ({
      searchParams: Promise.resolve(token ? { token } : {}),
      params: Promise.resolve({}),
    }) as unknown as PageProps<"/member/password">;

  it("says the link is invalid without a token", async () => {
    render(await MemberPasswordPage(props()));
    expect(screen.getByRole("alert")).toHaveTextContent("連結已失效，請聯絡管理員重發");
  });

  it("carries the token in the form", async () => {
    render(await MemberPasswordPage(props("abc123")));
    expect(document.querySelector('input[name="token"]')).toHaveValue("abc123");
    expect(screen.getByLabelText("新密碼")).toHaveAttribute("minlength", "8");
    // The password is asked twice; both stay hidden until their own toggle is pressed.
    for (const label of ["新密碼", "再次輸入新密碼"]) {
      expect(screen.getByLabelText(label)).toHaveAttribute("type", "password");
      expect(screen.getByLabelText(label)).toBeRequired();
    }
    expect(screen.getByLabelText("再次輸入新密碼")).toHaveAttribute("name", "passwordConfirm");
  });
});
