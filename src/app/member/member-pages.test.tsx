import { render, screen, within } from "@testing-library/react";
import {
  fetchMemberFriends,
  fetchMemberFriendSummary,
  fetchMemberMatches,
  fetchMemberProfile,
  fetchMemberVideoSubmissions,
} from "@/lib/member-session";
import type { FriendsOverview } from "@/types/friends";
import { fetchAboutContent } from "@/lib/public-content-client";
import type { MemberProfile, MemberVideoSubmissions } from "@/types/member";
import MemberPage from "./page";
import MemberLoginPage from "./login/page";
import MemberRegisterPage from "./register/page";
import MemberPasswordPage from "./password/page";

jest.mock("@/lib/member-session", () => ({
  fetchMemberProfile: jest.fn(),
  fetchMemberVideoSubmissions: jest.fn(),
  fetchMemberMatches: jest.fn(),
  fetchMemberFriends: jest.fn(),
  fetchMemberFriendSummary: jest.fn(),
}));
jest.mock("@/lib/public-content-client", () => ({ fetchAboutContent: jest.fn() }));
jest.mock("next/navigation", () => ({ useRouter: () => ({ refresh: jest.fn(), push: jest.fn() }) }));
// The forms call Server Actions; the pages only need them to exist.
jest.mock("./actions", () => ({
  loginAction: jest.fn(),
  logoutAction: jest.fn(),
  registerAction: jest.fn(),
  requestResetAction: jest.fn(),
  setPasswordAction: jest.fn(),
  updateNicknameAction: jest.fn(),
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
  (fetchMemberFriendSummary as jest.Mock).mockResolvedValue(0);
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
    { id: "p1", title: "十一月賽車", startDate: "2026-11-01", startTime: "19:00", status: "active", registeredAt: "" },
  ],
  steam: null,
  canCreateMatch: false,
};

/** Page props for /member with any query (e.g. ?steam= from /steam/callback). */
const memberQuery = (query: Record<string, string>) =>
  ({ searchParams: Promise.resolve(query), params: Promise.resolve({}) }) as unknown as PageProps<"/member">;

describe("/member", () => {
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

  it("opens the 個人資料 tab by default: the details and the nickname form", async () => {
    (fetchMemberProfile as jest.Mock).mockResolvedValue(profile);
    render(await MemberPage(memberProps()));

    const details = screen.getByRole("region", { name: "個人資料" });
    for (const value of ["XPA-0001", "王小明", "ming", "ming#1234", "ming@example.com", "0912345678", "一般會員"]) {
      expect(within(details).getAllByText(value).length).toBeGreaterThan(0);
    }
    expect(within(details).getByLabelText("暱稱")).toHaveValue("小明");
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
        },
      ],
    });
    render(await MemberPage(memberProps("matches")));

    const panel = screen.getByRole("region", { name: "內戰場次" });
    // The rating sits in the left column, under the heading.
    const heading = within(panel).getByRole("heading", { level: 2, name: "內戰場次" });
    expect(heading.parentElement).toContainElement(within(panel).getByText("1234"));
    const row = within(panel).getByRole("link", { name: /週五晚場/ });
    expect(row).toHaveAttribute("href", "/matches/m1");
    expect(within(row).getByText("A 隊・隊長")).toBeInTheDocument();
    expect(within(row).getByText("小華・2026/10/25 08:00")).toBeInTheDocument();
    expect(within(panel).getByRole("link", { name: "查看所有內戰場次" })).toHaveAttribute("href", "/matches");
  });

  it("asks a member without Steam to link it before scrims", async () => {
    (fetchMemberProfile as jest.Mock).mockResolvedValue(profile);
    (fetchMemberMatches as jest.Mock).mockResolvedValue({ steamLinked: false, rating: null, items: [] });
    render(await MemberPage(memberProps("matches")));

    const panel = screen.getByRole("region", { name: "內戰場次" });
    expect(panel).toHaveTextContent("參加內戰與評分需要先綁定 Steam 帳號");
    expect(within(panel).getByRole("link", { name: "查看所有內戰場次" })).toBeInTheDocument();
  });

  describe("好友 tab", () => {
    const overview: FriendsOverview = {
      memberCode: "XPA-0001",
      friends: [
        { memberId: "m2", nickname: "小華", memberCode: "XPA-0002", hasSteam: true, since: "2026-10-30T10:00:00.000Z" },
        {
          memberId: "m3",
          nickname: "小美",
          memberCode: "XPA-0003",
          hasSteam: false,
          since: "2026-10-30T10:00:00.000Z",
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
          from: { nickname: "小華", memberCode: "XPA-0002" },
          match: { id: "x1", title: "週五內戰", status: "lobby", playerCount: 7, rosterSize: 10 },
          createdAt: "2026-10-31T11:00:00.000Z",
        },
        {
          id: "i2",
          kind: "signup",
          from: { nickname: "小美", memberCode: "XPA-0003" },
          match: { id: "x2", title: "週六內戰", status: "lobby", playerCount: 2, rosterSize: 10 },
          createdAt: "2026-10-31T09:00:00.000Z",
        },
      ],
    };

    it("lists the friends first, then the member's number, the add form, invites and requests beside them", async () => {
      (fetchMemberProfile as jest.Mock).mockResolvedValue(profile);
      (fetchMemberFriends as jest.Mock).mockResolvedValue(overview);
      (fetchMemberFriendSummary as jest.Mock).mockResolvedValue(3);
      render(await MemberPage(memberProps("friends")));

      const tab = screen.getByRole("link", { name: /好友/ });
      expect(tab).toHaveAttribute("aria-current", "page");
      expect(tab).toHaveTextContent("（3 件待處理）");

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
      expect(group).toHaveTextContent("「小華」邀你加入小隊");
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

  describe("投稿影片 tab", () => {
    it("explains the review, the YouTube channel and the limits above both forms", async () => {
      (fetchMemberProfile as jest.Mock).mockResolvedValue(profile);
      (fetchMemberVideoSubmissions as jest.Mock).mockResolvedValue(submissions());
      render(await MemberPage(memberProps("videos")));

      expect(screen.getByRole("link", { name: "投稿影片" })).toHaveAttribute("aria-current", "page");
      const notices = screen.getByRole("list", { name: "投稿須知" });
      expect(notices).toHaveTextContent("投稿後需由管理員審核，通過後才會出現在網站上。");
      expect(notices).toHaveTextContent("通過的影片會陸續上傳至官網 YouTube 頻道。");
      expect(notices).toHaveTextContent("每天最多 5 部");
      expect(notices).toHaveTextContent("MP4／WebM、500 MB");
      expect(screen.getByRole("form", { name: "以 YouTube 連結投稿" })).toBeInTheDocument();
      expect(screen.getByRole("form", { name: "上傳影片檔投稿" })).toBeInTheDocument();
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
      const notices = screen.getByRole("list", { name: "投稿須知" });
      expect(history.parentElement).toHaveClass("lg:col-start-8");
      expect(history.parentElement).not.toContainElement(notices);
    });

    it("shows a member without the permission why there is no form, but still their history", async () => {
      (fetchMemberProfile as jest.Mock).mockResolvedValue(profile);
      (fetchMemberVideoSubmissions as jest.Mock).mockResolvedValue(submissions({ canSubmit: false }));
      render(await MemberPage(memberProps("videos")));

      expect(screen.getByText(/目前的角色不能投稿影片/)).toBeInTheDocument();
      expect(screen.queryByRole("form", { name: "以 YouTube 連結投稿" })).not.toBeInTheDocument();
      expect(within(screen.getByRole("region", { name: "投稿紀錄" })).getAllByRole("listitem")).toHaveLength(2);
      expect(fetchAboutContent).not.toHaveBeenCalled();
    });

    it("says submissions are paused, with no form but the history kept", async () => {
      (fetchMemberProfile as jest.Mock).mockResolvedValue(profile);
      (fetchMemberVideoSubmissions as jest.Mock).mockResolvedValue(submissions({ paused: true, canSubmit: false }));
      render(await MemberPage(memberProps("videos")));

      expect(screen.getByText("影片投稿目前暫停，恢復後即可投稿。")).toBeInTheDocument();
      expect(screen.queryByText(/目前的角色不能投稿影片/)).not.toBeInTheDocument();
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
    for (const label of ["姓名", "暱稱", "帳號", "Discord ID", "Email"]) {
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
  });
});
