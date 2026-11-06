import { act, fireEvent, render, screen, within } from "@testing-library/react";
import MatchesPage from "./page";
import MatchPage from "./[id]/page";
import NewMatchPage from "./new/page";
import { fetchManagedMatch, fetchMatchFriends, fetchMatchServers, fetchViewerMatch } from "@/lib/player-actor";
import { fetchMatchDetail, fetchMatches, fetchPartyList } from "@/lib/public-content-client";
import { fetchMemberProfile } from "@/lib/member-session";
import type { ManagedMatch, MatchDetail, MatchPlayer, MatchVeto, ViewerMatch } from "@/types/match";

const NOT_FOUND = new Error("NEXT_NOT_FOUND");
jest.mock("next/navigation", () => ({
  notFound: () => {
    throw NOT_FOUND;
  },
  useRouter: () => ({ refresh: mockRefresh }),
}));
const mockRefresh = jest.fn();
jest.mock("@/lib/player-actor", () => ({
  fetchViewerMatch: jest.fn(),
  fetchManagedMatch: jest.fn(),
  fetchMatchFriends: jest.fn(),
  fetchMatchServers: jest.fn(),
}));
jest.mock("@/lib/public-content-client", () => ({
  fetchMatches: jest.fn(),
  fetchMatchDetail: jest.fn(),
  fetchPartyList: jest.fn(),
}));
jest.mock("@/lib/member-session", () => ({ fetchMemberProfile: jest.fn() }));
// The forms post to Server Actions; the pages only need them to exist.
jest.mock("@/app/matches/actions", () =>
  Object.fromEntries(
    [
      "cancelMatchAction",
      "confirmTeamsAction",
      "createMatchAction",
      "generateTeamsAction",
      "importPartyAction",
      "joinGroupAction",
      "leaveAction",
      "lockAction",
      "removePlayerAction",
      "signUpAction",
      "unconfirmTeamsAction",
      "unlockAction",
      "captainBanAction",
      "managerBanAction",
      "vetoStartAction",
      "vetoUndoAction",
      "vetoResetAction",
      "inviteFriendAction",
      "serverStartAction",
      "serverAbortAction",
      "matchResultAction",
      "teamNameAction",
      "managerTeamNameAction",
    ].map((name) => [name, jest.fn()]),
  ),
);

const player = (id: string, name: string, rating?: number, extra: object = {}) => ({
  playerId: id,
  name,
  team: null,
  isCaptain: false,
  joinedAt: "2026-10-25T10:00:00.000Z",
  ...(rating === undefined ? {} : { rating }),
  ...extra,
});

const base: MatchDetail = {
  id: "m1",
  title: "週五晚場",
  status: "lobby",
  game: { id: "cs2", name: "CS2" },
  party: { id: "p1", title: "週末對戰夜" },
  playerCount: 3,
  capacity: 10,
  createdAt: "2026-10-25T00:00:00.000Z",
  createdBy: "阿強",
  entries: [
    { id: "e1", isGroup: true, ownerPlayerId: "a", players: [player("a", "阿強"), player("b", "小明")] },
    { id: "e2", isGroup: false, ownerPlayerId: "c", players: [player("c", "訪客C")] },
  ],
  teams: null,
  lockedAt: null,
  confirmedAt: null,
  cancelledAt: null,
  veto: null,
  server: null,
  candidates: null,
  teamNamesOpen: false,
};

/** The match with confirmed teams: 阿強 (captain) on A, 小明 (captain) and 訪客C on B. */
const teamed = (match: MatchDetail = base, names = { A: "A 隊", B: "B 隊" }): MatchDetail => ({
  ...match,
  entries: [
    {
      id: "e1",
      isGroup: false,
      ownerPlayerId: "a",
      players: [
        player("a", "阿強", undefined, { team: "A", isCaptain: true }),
        player("b", "小明", undefined, { team: "B", isCaptain: true }),
      ],
    },
    { id: "e2", isGroup: false, ownerPlayerId: "c", players: [player("c", "訪客C", undefined, { team: "B" })] },
  ],
  teams: {
    A: { name: names.A, playerIds: ["a"], captainId: "a", total: 1500, average: 1500 },
    B: { name: names.B, playerIds: ["c", "b"], captainId: "b", total: 2400, average: 1200 },
    difference: 900,
  },
});

const withRatings = (match: MatchDetail): MatchDetail => ({
  ...match,
  entries: match.entries.map((entry) => ({
    ...entry,
    players: entry.players.map((p, i) => ({ ...p, rating: 1000 + i * 100 })),
  })),
});

const viewer = (overrides: Partial<ViewerMatch["viewer"]> = {}, match: MatchDetail = base): ViewerMatch => ({
  ...withRatings(match),
  viewer: {
    playerId: "z",
    entryId: null,
    inviteCode: null,
    canManage: false,
    canBan: false,
    captainOf: null,
    connect: null,
    ...overrides,
  },
  stats: [],
});

const renderMatch = async (search: Record<string, string> = {}) =>
  render(await MatchPage({ params: Promise.resolve({ id: "m1" }), searchParams: Promise.resolve(search) }));

beforeEach(() => {
  jest.clearAllMocks();
  (fetchViewerMatch as jest.Mock).mockResolvedValue(null);
  (fetchManagedMatch as jest.Mock).mockResolvedValue(null);
  (fetchMatchDetail as jest.Mock).mockResolvedValue(base);
  (fetchMemberProfile as jest.Mock).mockResolvedValue(null);
});

describe("/matches", () => {
  beforeEach(() => {
    (fetchMatches as jest.Mock).mockResolvedValue({ items: [base], total: 1, page: 1, pageSize: 50 });
  });

  it("lists matches with status, head count, creator and creation time", async () => {
    render(await MatchesPage());
    const row = screen.getByRole("link", { name: /週五晚場/ });
    expect(row).toHaveAttribute("href", "/matches/m1");
    // 00:00 UTC is 08:00 in Taiwan.
    expect(within(row).getByText("阿強・2026/10/25 08:00")).toBeInTheDocument();
    expect(within(row).getByText("3 / 10")).toBeInTheDocument();
    expect(within(row).getByText("報名中")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /建立場次/ })).not.toBeInTheDocument();
  });

  it("offers 建立場次 only to a member the backend allows", async () => {
    (fetchMemberProfile as jest.Mock).mockResolvedValue({ canCreateMatch: true });
    render(await MatchesPage());
    expect(screen.getByRole("link", { name: /建立場次/ })).toHaveAttribute("href", "/matches/new");
  });
});

describe("/matches/[id]", () => {
  it("shows a visitor the roster by group and the Steam sign-in, without ratings", async () => {
    await renderMatch();
    expect(screen.getByRole("heading", { name: "小隊 1（2 人）" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "單人報名（1 人）" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /以 Steam 登入/ })).toHaveAttribute("href", "/steam/login?intent=guest");
    expect(screen.getByText("登入後可看到每位玩家的評分")).toBeInTheDocument();
    expect(screen.queryByText("1000")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "單人報名" })).not.toBeInTheDocument();
  });

  it("calls notFound() for an unknown match", async () => {
    (fetchMatchDetail as jest.Mock).mockResolvedValue(null);
    await expect(renderMatch()).rejects.toBe(NOT_FOUND);
  });

  it("gives a signed-in player the sign-up choices and everyone's ratings", async () => {
    (fetchViewerMatch as jest.Mock).mockResolvedValue(viewer());
    await renderMatch();
    expect(screen.getByRole("button", { name: "單人報名" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "建立小隊" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "邀請碼" })).toBeInTheDocument();
    expect(screen.getByText("1100")).toBeInTheDocument();
    expect(screen.queryByText("登入後可看到每位玩家的評分")).not.toBeInTheDocument();
  });

  it("tells a member without Steam to link it first", async () => {
    (fetchViewerMatch as jest.Mock).mockResolvedValue(viewer({ playerId: null }));
    await renderMatch();
    expect(screen.getByRole("link", { name: "到會員頁綁定 Steam" })).toHaveAttribute("href", "/member");
    expect(screen.queryByRole("button", { name: "單人報名" })).not.toBeInTheDocument();
  });

  it("shows a group member their own invite code and 退出報名", async () => {
    (fetchViewerMatch as jest.Mock).mockResolvedValue(viewer({ playerId: "a", entryId: "e1", inviteCode: "K7P2QM" }));
    await renderMatch();
    expect(screen.getByText("K7P2QM")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "退出報名" })).toBeInTheDocument();
  });

  describe("邀請好友", () => {
    const friend = (memberId: string, nickname: string, extra: object = {}) => ({
      memberId,
      nickname,
      memberCode: null,
      hasSteam: true,
      seated: false,
      invited: { group: false, signup: false },
      note: null,
      ...extra,
    });

    it("lists each friend with their state, offering 邀進小隊 only when the member has a group with room", async () => {
      (fetchViewerMatch as jest.Mock).mockResolvedValue(viewer({ playerId: "a", entryId: "e1", inviteCode: "K7P2QM" }));
      (fetchMatchFriends as jest.Mock).mockResolvedValue({
        canInviteToGroup: true,
        friends: [
          friend("m1", "小華", { note: "大學室友" }),
          friend("m2", "小美", { hasSteam: false, invited: { group: true, signup: false } }),
          friend("m3", "阿強", { seated: true }),
        ],
      });
      await renderMatch();

      const block = screen.getByRole("region", { name: "邀請好友" });
      const [hua, mei, keung] = within(within(block).getByRole("list", { name: "好友" })).getAllByRole("listitem");
      // The member's own note follows the nickname, which opens the friend's page.
      expect(hua).toHaveTextContent("備註：大學室友");
      expect(within(hua).getByRole("link", { name: "小華" })).toHaveAttribute("href", "/member/friends/m1");
      expect(mei).not.toHaveTextContent("備註");
      expect(within(hua).getByRole("button", { name: "邀進小隊" })).toBeInTheDocument();
      expect(within(hua).getByRole("button", { name: "邀請報名" })).toBeInTheDocument();
      expect(mei).toHaveTextContent("已邀請進小隊");
      expect(mei).toHaveTextContent("尚未綁定 Steam");
      expect(within(mei).queryByRole("button", { name: "邀進小隊" })).not.toBeInTheDocument();
      expect(keung).toHaveTextContent("已在名單");
      expect(within(keung).queryByRole("button")).not.toBeInTheDocument();
    });

    it("offers only 邀請報名 without a group, and points to the 好友 tab without friends", async () => {
      (fetchViewerMatch as jest.Mock).mockResolvedValue(viewer());
      (fetchMatchFriends as jest.Mock).mockResolvedValue({ canInviteToGroup: false, friends: [friend("m1", "小華")] });
      await renderMatch();
      const block = screen.getByRole("region", { name: "邀請好友" });
      expect(within(block).queryByRole("button", { name: "邀進小隊" })).not.toBeInTheDocument();
      expect(within(block).getByRole("button", { name: "邀請報名" })).toBeInTheDocument();
    });

    it("points a member without friends to the 好友 tab", async () => {
      (fetchViewerMatch as jest.Mock).mockResolvedValue(viewer());
      (fetchMatchFriends as jest.Mock).mockResolvedValue({ canInviteToGroup: false, friends: [] });
      await renderMatch();
      expect(screen.getByRole("link", { name: /加好友/ })).toHaveAttribute("href", "/member?tab=friends");
    });

    it("is not shown to visitors, guests or once sign-up has closed", async () => {
      await renderMatch();
      expect(fetchMatchFriends).not.toHaveBeenCalled();

      (fetchViewerMatch as jest.Mock).mockResolvedValue(viewer());
      (fetchMatchFriends as jest.Mock).mockResolvedValue(null);
      await renderMatch();
      expect(screen.queryByRole("region", { name: "邀請好友" })).not.toBeInTheDocument();

      jest.clearAllMocks();
      (fetchViewerMatch as jest.Mock).mockResolvedValue(viewer({}, { ...base, status: "roster_locked" }));
      await renderMatch();
      expect(fetchMatchFriends).not.toHaveBeenCalled();
    });
  });

  it("puts team A left and team B right of what happens now, by their names, once confirmed", async () => {
    (fetchMatchDetail as jest.Mock).mockResolvedValue(
      teamed({ ...base, status: "teams_confirmed" }, { A: "紅龍", B: "B 隊" }),
    );
    const { container } = await renderMatch();
    const room = screen.getByRole("region", { name: "比賽室" });
    const teamA = within(room).getByRole("region", { name: "紅龍" });
    expect(within(teamA).getByText("阿強")).toBeInTheDocument();
    expect(within(teamA).getByText("隊長")).toBeInTheDocument();
    expect(within(teamA).getByText("總分 1500・平均 1500")).toBeInTheDocument();
    // The captain leads the team although 訪客C comes first in the team's ids.
    const teamB = within(room).getByRole("region", { name: "B 隊" });
    expect(within(teamB).getAllByRole("listitem").map((li) => li.textContent)).toEqual(["隊長小明", "訪客C"]);
    // DOM order A, stage, B (left to right); on narrow screens the stage moves up first.
    const stage = container.querySelector("[data-stage]")!.parentElement!;
    const columns = [...stage.parentElement!.children].map((el) =>
      el === stage ? "stage" : el.getAttribute("data-team"),
    );
    expect(columns).toEqual(["A", "stage", "B"]);
    expect(stage).toHaveClass("order-first");
    expect(within(room).getByText("隊伍已確認，等待開始 Ban 圖。")).toBeInTheDocument();
    expect(within(room).getByText("900")).toBeInTheDocument();
    // Signing up is over, so its section is gone.
    expect(screen.queryByRole("region", { name: "報名" })).not.toBeInTheDocument();
  });

  it("gives the creating member the management tools for the status", async () => {
    (fetchViewerMatch as jest.Mock).mockResolvedValue(viewer({ canManage: true }));
    const managed: ManagedMatch = {
      ...withRatings(base),
      entries: withRatings(base).entries.map((e) => ({ ...e, inviteCode: e.isGroup ? "K7P2QM" : null })),
      createdBy: "會員host1",
      createdByMemberId: "host1",
      stats: [],
      connect: null,
      serverSession: null,
      candidates: null,
    };
    (fetchManagedMatch as jest.Mock).mockResolvedValue(managed);
    await renderMatch();
    // The step of the status sits in the match room, under the roster.
    const room = screen.getByRole("region", { name: "比賽室" });
    expect(within(room).getByRole("button", { name: "鎖定名單" })).toBeInTheDocument();
    expect(within(room).getByRole("button", { name: "從派對帶入" })).toBeInTheDocument();
    const manage = screen.getByRole("region", { name: "管理" });
    expect(within(manage).queryByRole("button", { name: "鎖定名單" })).not.toBeInTheDocument();
    expect(within(manage).getByRole("combobox", { name: "玩家" })).toBeInTheDocument();
    expect(within(manage).getByRole("heading", { name: "移出玩家" })).toBeInTheDocument();
    expect(within(manage).getByRole("checkbox", { name: "確認把這位玩家移出名單" })).toBeRequired();
    expect(within(manage).getByText("K7P2QM")).toBeInTheDocument();
    expect(within(manage).getByRole("button", { name: "取消場次" })).toBeInTheDocument();
  });

  it("compares the candidates and presets the chosen one in the team form", async () => {
    const side = (ids: string[], total: number) => ({
      playerIds: ids,
      total,
      average: total / ids.length,
      players: ids.map((id) => ({ playerId: id, name: `玩家${id}`, rating: total / ids.length })),
      suggestedCaptain: ids[0],
    });
    const draft: ManagedMatch = {
      ...withRatings(base),
      status: "team_draft",
      createdBy: "admin",
      createdByMemberId: "host1",
      stats: [],
      connect: null,
      serverSession: null,
      candidates: [
        { teamA: side(["a", "c"], 2000), teamB: side(["b"], 1900), difference: 100 },
        { teamA: side(["a", "b"], 2100), teamB: side(["c"], 1800), difference: 300 },
      ],
    };
    (fetchViewerMatch as jest.Mock).mockResolvedValue(viewer({ canManage: true }, { ...base, status: "team_draft" }));
    (fetchManagedMatch as jest.Mock).mockResolvedValue(draft);
    await renderMatch({ candidate: "2" });

    expect(screen.getByText("分差 300")).toBeInTheDocument();
    // Each whole card is one link to its candidate; the chosen one is marked current.
    expect(screen.getByRole("link", { name: "方案 1" })).toHaveAttribute(
      "href",
      "/matches/m1?candidate=1#team-candidates",
    );
    expect(screen.getByRole("link", { name: "方案 2" })).toHaveAttribute("aria-current", "true");
    expect(screen.getByText("使用中：下方的分隊以這個方案預填")).toBeInTheDocument();
    // Candidate 2 puts 小明 (b) on team A.
    const bTeam = screen.getByRole("radiogroup", { name: "小明 的隊伍" });
    expect(within(bTeam).getByRole("radio", { name: "A 隊" })).toBeChecked();
    expect(screen.getByRole("combobox", { name: "A 隊隊長" })).toHaveValue("a");
    expect(screen.getByRole("checkbox", { name: /允許拆開小隊/ })).not.toBeChecked();
    // Optional team names, empty meaning A 隊 / B 隊.
    expect(screen.getByRole("textbox", { name: "A 隊隊名" })).not.toBeRequired();
    expect(screen.getByRole("textbox", { name: "B 隊隊名" })).toHaveAccessibleDescription(
      "沒填就顯示「B 隊」；最多 20 個字，不能有雙引號或分號。",
    );
    // The candidates and the team form are the step of the status, in the match room.
    const room = screen.getByRole("region", { name: "比賽室" });
    expect(within(room).getByRole("button", { name: "確認分隊" })).toBeInTheDocument();

    // Each captain list holds only that team; moving a player moves them between the lists.
    const captainNames = (team: string) =>
      within(screen.getByRole("combobox", { name: `${team} 隊隊長` }))
        .getAllByRole("option")
        .map((option) => option.textContent)
        .slice(1);
    expect(captainNames("A")).toEqual(["阿強", "小明"]);
    expect(captainNames("B")).toEqual(["訪客C"]);
    fireEvent.click(within(bTeam).getByRole("radio", { name: "B 隊" }));
    expect(captainNames("A")).toEqual(["阿強"]);
    expect(captainNames("B")).toEqual(["小明", "訪客C"]);

    // Unlocking and cancelling sit side by side at the end of the management area.
    const manage = screen.getByRole("region", { name: "管理" });
    expect(within(manage).getByRole("heading", { name: "解除鎖定" })).toBeInTheDocument();
    expect(within(manage).getByRole("heading", { name: "取消場次" })).toBeInTheDocument();
  });
});

describe("/matches/[id] rating changes", () => {
  const done = (withChanges: boolean): MatchDetail => {
    const match = teamed({
      ...base,
      status: "completed",
      server: {
        serverName: null,
        scoreA: 13,
        scoreB: 9,
        winner: "A",
        resultSource: "manual",
        liveAt: null,
        completedAt: "2026-11-07T12:00:00.000Z",
      },
    });
    if (!withChanges) return match;
    const changeOf: Record<string, MatchPlayer["ratingChange"]> = {
      a: { delta: 28, teamPart: 25, personalPart: 3, note: null },
      b: { delta: -25, teamPart: -25, personalPart: 0, note: "no-stats" },
    };
    return {
      ...match,
      entries: match.entries.map((entry) => ({
        ...entry,
        players: entry.players.map((p) => (changeOf[p.playerId] ? { ...p, ratingChange: changeOf[p.playerId] } : p)),
      })),
    };
  };

  it("shows signed-in people each player's change in the match", async () => {
    (fetchViewerMatch as jest.Mock).mockResolvedValue(viewer({}, done(true)));
    await renderMatch();
    const teamA = screen.getByRole("region", { name: "A 隊" });
    expect(within(teamA).getByText("阿強").closest("li")).toHaveTextContent("評分+28（勝負 +25・個人 +3）");
    const teamB = screen.getByRole("region", { name: "B 隊" });
    expect(within(teamB).getByText("小明").closest("li")).toHaveTextContent("評分−25（勝負 −25・沒有個人數據）");
    expect(within(teamB).getByText("訪客C").closest("li")).not.toHaveTextContent("評分");
  });

  it("shows visitors the result without anyone's change", async () => {
    (fetchMatchDetail as jest.Mock).mockResolvedValue(done(false));
    const { container } = await renderMatch();
    expect(screen.getByRole("region", { name: "比賽" })).toHaveTextContent("A 隊獲勝");
    expect(container.querySelector("[data-rating-change]")).toBeNull();
  });
});

describe("/matches/[id] drafting and team names", () => {
  const side = (ids: string[], total: number, withRatings: boolean) => ({
    playerIds: ids,
    total,
    average: total / ids.length,
    players: ids.map((id) => ({
      playerId: id,
      name: `玩家${id}`,
      ...(withRatings ? { rating: total / ids.length } : {}),
    })),
    suggestedCaptain: ids[0],
  });

  it("shows everyone the candidates to follow, without choosing or (for visitors) ratings", async () => {
    (fetchMatchDetail as jest.Mock).mockResolvedValue({
      ...base,
      status: "team_draft",
      candidates: [{ teamA: side(["a", "c"], 2000, false), teamB: side(["b"], 1900, false), difference: 100 }],
    });
    await renderMatch();
    const candidates = screen.getByRole("region", { name: "分隊候選" });
    expect(within(candidates).getByText("方案 1")).toBeInTheDocument();
    expect(within(candidates).getByText("分差 100")).toBeInTheDocument();
    expect(within(candidates).queryByRole("link")).not.toBeInTheDocument();
    expect(within(candidates).queryByText("1000")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "確認分隊" })).not.toBeInTheDocument();
  });

  it("gives a captain a rename form on their own team only, while the names are open", async () => {
    (fetchViewerMatch as jest.Mock).mockResolvedValue(
      viewer({ captainOf: "A" }, { ...teamed({ ...base, status: "veto_complete" }), teamNamesOpen: true }),
    );
    await renderMatch();
    const teamA = screen.getByRole("region", { name: "A 隊" });
    expect(within(teamA).getByRole("textbox", { name: "我們的隊名" })).toHaveValue("");
    expect(within(teamA).getByRole("button", { name: "改名" })).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "B 隊" })).queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("gives the manager a rename form on both teams, and nobody one once the match is on the server", async () => {
    const confirmed = { ...teamed({ ...base, status: "teams_confirmed" }, { A: "紅龍", B: "B 隊" }), teamNamesOpen: true };
    (fetchViewerMatch as jest.Mock).mockResolvedValue(viewer({ canManage: true }, confirmed));
    (fetchManagedMatch as jest.Mock).mockResolvedValue({
      ...withRatings(confirmed),
      createdBy: "阿凱",
      createdByMemberId: "host1",
      stats: [],
      connect: null,
      serverSession: null,
    });
    const { unmount } = await renderMatch();
    expect(screen.getByRole("textbox", { name: "A 隊隊名" })).toHaveValue("紅龍");
    expect(screen.getByRole("textbox", { name: "B 隊隊名" })).toHaveValue("");
    unmount();

    (fetchViewerMatch as jest.Mock).mockResolvedValue(
      viewer({ captainOf: "A" }, { ...teamed({ ...base, status: "in_game" }), teamNamesOpen: false }),
    );
    (fetchManagedMatch as jest.Mock).mockResolvedValue(null);
    await renderMatch();
    expect(screen.queryByRole("button", { name: "改名" })).not.toBeInTheDocument();
  });
});

describe("/matches/[id] refreshing by itself", () => {
  afterEach(() => jest.useRealTimers());

  const refreshes = async (match: MatchDetail) => {
    (fetchMatchDetail as jest.Mock).mockResolvedValue(match);
    // Fake timers first: the room sets its interval when it mounts.
    jest.useFakeTimers();
    await renderMatch();
    mockRefresh.mockClear();
    act(() => jest.advanceTimersByTime(10_000));
    return mockRefresh.mock.calls.length > 0;
  };

  it("follows sign-ups, the lock, the teams and the veto start without reloading", async () => {
    expect(await refreshes(base)).toBe(true);
  });

  it("follows confirmed teams waiting for the veto", async () => {
    expect(await refreshes(teamed({ ...base, status: "teams_confirmed" }))).toBe(true);
  });

  it("stops once the match is over", async () => {
    expect(await refreshes({ ...base, status: "cancelled" })).toBe(false);
  });
});

describe("/matches/new", () => {
  it("explains when the member may not create matches", async () => {
    (fetchMemberProfile as jest.Mock).mockResolvedValue({ canCreateMatch: false });
    render(await NewMatchPage());
    expect(screen.getByText(/目前無法建立內戰場次/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "建立場次" })).not.toBeInTheDocument();
  });

  it("offers only the active games parties, the game being fixed", async () => {
    (fetchMemberProfile as jest.Mock).mockResolvedValue({ canCreateMatch: true });
    (fetchPartyList as jest.Mock).mockResolvedValue([{ id: "p1", title: "週末對戰夜", startDate: "2026-11-01" }]);
    render(await NewMatchPage());
    expect(fetchPartyList).toHaveBeenCalledWith("active", "all", "games");
    // The game is fixed (Counter-Strike 2): no game field.
    expect(screen.queryByRole("combobox", { name: "遊戲" })).not.toBeInTheDocument();
    expect(screen.getByRole("option", { name: "2026-11-01 週末對戰夜" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "建立場次" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /內戰場次/ })).toHaveAttribute("href", "/matches");
  });
});

describe("/matches/[id] map veto", () => {
  const maps = [
    ["de_ancient", "Ancient"],
    ["de_mirage", "Mirage"],
    ["de_nuke", "Nuke"],
  ] as const;
  const veto = (overrides: Partial<MatchVeto> = {}): MatchVeto => ({
    rule: "weaker_first",
    firstTeam: "B",
    firstReason: "b-lower",
    stepSeconds: 30,
    startedAt: "2026-10-26T10:00:00.000Z",
    maps: maps.map(([key, name], i) => ({
      key,
      name,
      imageUrl: key === "de_nuke" ? null : `/media/images/${key}.jpg`,
      bannedBy: i === 0 ? "B" : null,
      step: i === 0 ? 1 : null,
      wins: { A: i, B: 0 },
    })),
    bans: [
      {
        step: 1,
        team: "B",
        mapKey: "de_ancient",
        mapName: "Ancient",
        byManager: true,
        random: true,
        actorLabel: "阿凱",
        at: "2026-10-26T10:00:40.000Z",
      },
    ],
    turn: "A",
    step: 2,
    stepDeadline: "2026-10-26T10:01:10.000Z",
    overdue: true,
    finalMap: null,
    ...overrides,
  });
  const vetoMatch = (v = veto()): MatchDetail => teamed({ ...base, status: "veto_active", veto: v });

  it("shows everyone the first team and why, the turn, each map's state and the history", async () => {
    (fetchMatchDetail as jest.Mock).mockResolvedValue(vetoMatch());
    await renderMatch();

    const panel = screen.getByRole("region", { name: "Ban 圖" });
    expect(panel).toHaveTextContent("先手：B 隊（B 隊總分較低，規則為總分低的隊伍先手）");
    expect(within(panel).getByRole("status")).toHaveTextContent("輪到 A 隊・第 2 步");
    expect(within(panel).getByRole("status")).toHaveTextContent("時間到，即將隨機 Ban");
    const mapList = within(panel).getByRole("list", { name: "地圖" });
    // Who banned it, with the step on its own line.
    expect(within(mapList).getByText("B 隊 Ban")).toBeInTheDocument();
    expect(within(mapList).getByText("（第 1 步）")).toBeInTheDocument();
    // Nobody but the captain whose turn it is gets anything on the maps left: no 可選 either.
    expect(within(mapList).queryByText("可選")).not.toBeInTheDocument();
    expect(panel.querySelector("[data-radar]")).not.toBeNull();
    // The veto sits in the middle of the room.
    const room = screen.getByRole("region", { name: "比賽室" });
    expect(within(room).getByRole("region", { name: "Ban 圖" })).toBe(panel);
    expect(within(panel).queryByRole("button", { name: /^Ban / })).not.toBeInTheDocument();
    expect(panel).toHaveTextContent("第 1 步・B 隊 Ban Ancient");
    expect(panel).toHaveTextContent("阿凱（管理者隨機 Ban）");
  });

  it("marks a step the system banned when time ran out", async () => {
    const [ban] = veto().bans;
    (fetchMatchDetail as jest.Mock).mockResolvedValue(
      vetoMatch(veto({ bans: [{ ...ban, byManager: false, random: true, actorLabel: "系統" }] })),
    );
    await renderMatch();

    const panel = screen.getByRole("region", { name: "Ban 圖" });
    expect(panel).toHaveTextContent("第 1 步・B 隊 Ban Ancient");
    expect(panel).toHaveTextContent("時間到，系統隨機 Ban");
    expect(panel).not.toHaveTextContent("系統（");
  });

  it("shows each map as a card with its name over a decorative image, or a brand-colour face without one", async () => {
    (fetchMatchDetail as jest.Mock).mockResolvedValue(vetoMatch());
    const { container } = await renderMatch();

    const mapList = screen.getByRole("list", { name: "地圖" });
    expect(within(mapList).queryByRole("img")).not.toBeInTheDocument();
    const card = (key: string) => container.querySelector(`[data-map="${key}"]`) as HTMLElement;
    const image = (key: string) => card(key).querySelector("img");
    expect(image("de_mirage")).toHaveAttribute("src", "http://localhost:3001/media/images/de_mirage.jpg");
    expect(image("de_mirage")).toHaveAttribute("alt", "");
    // The image unveils on scroll; the name sits on a separate layer, outside the revealing image.
    expect(image("de_mirage")).toHaveClass("media-reveal");
    expect(card("de_mirage")).toHaveAttribute("data-spotlight");
    expect(card("de_mirage").querySelector(".media-reveal")).not.toHaveTextContent("Mirage");
    expect(card("de_mirage")).toHaveTextContent("MirageA 隊 1・B 隊 0");
    // Banned: the image turns grey and the card says who banned it.
    expect(image("de_ancient")).toHaveClass("grayscale");
    expect(card("de_ancient")).toHaveTextContent("B 隊 Ban（第 1 步）");
    expect(image("de_nuke")).toBeNull();
    expect(card("de_nuke").querySelector("[data-map-fallback]")).not.toBeNull();
  });

  it("gives the captain whose turn it is a Ban button on each map left", async () => {
    (fetchViewerMatch as jest.Mock).mockResolvedValue({
      ...vetoMatch(),
      viewer: { playerId: "a", entryId: "e1", inviteCode: null, canManage: false, canBan: true },
    });
    await renderMatch();

    const panel = screen.getByRole("region", { name: "Ban 圖" });
    expect(panel).toHaveTextContent("輪到你的隊伍，請選一張地圖 Ban。");
    expect(within(panel).getByRole("button", { name: "Ban Mirage" })).toBeInTheDocument();
    expect(within(panel).getByRole("button", { name: "Ban Nuke" })).toBeInTheDocument();
    expect(within(panel).queryByRole("button", { name: "Ban Ancient" })).not.toBeInTheDocument();
  });

  it("shows the map played once the veto is over", async () => {
    (fetchMatchDetail as jest.Mock).mockResolvedValue({
      ...vetoMatch(
        veto({
          turn: null,
          step: null,
          stepDeadline: null,
          overdue: false,
          finalMap: { key: "de_nuke", name: "Nuke", imageUrl: null },
        }),
      ),
      status: "veto_complete",
    });
    await renderMatch();
    const panel = screen.getByRole("region", { name: "Ban 圖" });
    expect(panel).toHaveTextContent("比賽地圖：Nuke");
    expect(within(panel).queryByRole("status")).not.toBeInTheDocument();
  });

  it("gives the creator the veto tools for the status: start, ban for a team, undo and reset", async () => {
    const managed = (match: MatchDetail): ManagedMatch => ({
      ...withRatings(match),
      createdBy: "阿凱",
      createdByMemberId: "host1",
      stats: [],
      connect: null,
      serverSession: null,
      candidates: null,
    });
    (fetchViewerMatch as jest.Mock).mockResolvedValue(
      viewer({ canManage: true }, teamed({ ...base, status: "teams_confirmed" })),
    );
    (fetchManagedMatch as jest.Mock).mockResolvedValue(managed(teamed({ ...base, status: "teams_confirmed" })));
    const { unmount } = await renderMatch();
    let room = screen.getByRole("region", { name: "比賽室" });
    expect(within(room).getByRole("radio", { name: "隨機（預設）" })).toBeChecked();
    expect(within(room).getByRole("textbox", { name: "每步期限（秒）" })).toHaveValue("30");
    expect(within(room).getByRole("button", { name: "開始 Ban 圖" })).toBeInTheDocument();
    expect(room).toHaveTextContent("時間到會自動隨機 Ban，管理者也可以隨時代為 Ban。");
    let manage = screen.getByRole("region", { name: "管理" });
    expect(within(manage).getByRole("checkbox", { name: /確認退回分隊/ })).toBeRequired();
    expect(within(manage).getByRole("button", { name: "退回分隊" })).toBeInTheDocument();
    unmount();

    (fetchViewerMatch as jest.Mock).mockResolvedValue(viewer({ canManage: true }, vetoMatch()));
    (fetchManagedMatch as jest.Mock).mockResolvedValue(managed(vetoMatch()));
    await renderMatch();
    room = screen.getByRole("region", { name: "比賽室" });
    expect(within(room).getByRole("heading", { name: "代 A 隊 Ban" })).toBeInTheDocument();
    const select = within(room).getByRole("combobox", { name: "代為 Ban 的地圖" });
    expect(
      within(select)
        .getAllByRole("option")
        .map((o) => o.textContent),
    ).toEqual(["請選擇地圖", "Mirage", "Nuke"]);
    expect(within(room).getByRole("button", { name: "隨機 Ban" })).toBeInTheDocument();
    manage = screen.getByRole("region", { name: "管理" });
    expect(within(manage).getByRole("checkbox", { name: /確認撤銷最近一步/ })).toBeRequired();
    expect(within(manage).getByRole("checkbox", { name: /確認重設/ })).toBeRequired();
    expect(within(manage).queryByRole("button", { name: "退回分隊" })).not.toBeInTheDocument();
    expect(within(manage).getByRole("heading", { name: "取消場次" })).toBeInTheDocument();
  });
});

describe("/matches/[id] on the game server", () => {
  const decided: MatchDetail = teamed({ ...base, status: "veto_complete" });
  const managedOf = (match: MatchDetail, extra: Partial<ManagedMatch> = {}): ManagedMatch => ({
    ...withRatings(match),
    createdBy: "阿凱",
    createdByMemberId: "host1",
    candidates: null,
    stats: [],
    connect: null,
    serverSession: null,
    ...extra,
  });

  it("offers the free scrim servers and shows why the last start failed", async () => {
    (fetchViewerMatch as jest.Mock).mockResolvedValue(viewer({ canManage: true }, decided));
    (fetchManagedMatch as jest.Mock).mockResolvedValue(
      managedOf(decided, {
        serverSession: {
          status: "failed",
          serverId: "srv1",
          serverName: "CS2 #1",
          startedBy: "阿凱",
          createdAt: "2026-11-05T12:00:00.000Z",
          deadlineAt: "2026-11-05T12:10:00.000Z",
          scriptRunAt: null,
          rconSentAt: null,
          configFetchedAt: null,
          liveAt: null,
          endedAt: "2026-11-05T12:10:03.000Z",
          error: "伺服器沒有在期限內上線",
        },
      }),
    );
    (fetchMatchServers as jest.Mock).mockResolvedValue([
      { id: "srv1", name: "CS2 #1", inUse: false },
      { id: "srv2", name: "CS2 #2", inUse: true },
    ]);
    await renderMatch();
    // Starting is the step of the status, in the middle of the room; the manual score stays below.
    const room = screen.getByRole("region", { name: "比賽室" });
    const select = within(room).getByRole("combobox", { name: "伺服器" });
    expect(within(select).getByRole("option", { name: "CS2 #1" })).toBeInTheDocument();
    expect(within(select).queryByRole("option", { name: "CS2 #2" })).not.toBeInTheDocument();
    expect(within(room).getByText("使用中，暫時不能選：CS2 #2")).toBeInTheDocument();
    expect(within(room).getByRole("alert")).toHaveTextContent("上一次開打失敗：伺服器沒有在期限內上線");
    expect(within(room).getByRole("button", { name: "開打" })).toBeInTheDocument();
    const manage = screen.getByRole("region", { name: "管理" });
    expect(within(manage).getByRole("checkbox", { name: /確認以這個比分結束比賽/ })).toBeRequired();
  });

  it("shows the score to visitors without the way in or the stats", async () => {
    (fetchMatchDetail as jest.Mock).mockResolvedValue({
      ...teamed(base, { A: "紅龍", B: "B 隊" }),
      status: "in_game",
      server: {
        serverName: "CS2 #1",
        scoreA: 7,
        scoreB: 5,
        winner: null,
        resultSource: null,
        liveAt: "2026-11-05T12:05:00.000Z",
        completedAt: null,
      },
    });
    await renderMatch();
    const panel = screen.getByRole("region", { name: "比賽" });
    expect(panel).toHaveTextContent("比賽進行中。");
    expect(within(panel).getByLabelText("紅龍 7 比 B 隊 5")).toBeInTheDocument();
    expect(within(panel).queryByRole("link", { name: "進入遊戲" })).not.toBeInTheDocument();
    expect(within(panel).getByText("登入後可看到每位玩家的數據")).toBeInTheDocument();
  });

  it("gives a player of the match the way in", async () => {
    const waiting: MatchDetail = {
      ...teamed(),
      status: "server_ready",
      server: {
        serverName: "CS2 #1",
        scoreA: null,
        scoreB: null,
        winner: null,
        resultSource: null,
        liveAt: null,
        completedAt: null,
      },
    };
    (fetchViewerMatch as jest.Mock).mockResolvedValue(
      viewer(
        {
          entryId: "e1",
          connect: { address: "cs.example.com:27015", password: "pw123", url: "steam://connect/cs.example.com:27015/pw123" },
        },
        waiting,
      ),
    );
    await renderMatch();
    const panel = screen.getByRole("region", { name: "比賽" });
    expect(within(panel).getByRole("link", { name: "進入遊戲" })).toHaveAttribute(
      "href",
      "steam://connect/cs.example.com:27015/pw123",
    );
    expect(panel).toHaveTextContent("connect cs.example.com:27015; password pw123");
    expect(panel).toHaveTextContent("請先開啟 CS2，進到主選單後再按「進入遊戲」");
  });

  it("shows the result and each team's stats once completed", async () => {
    const done: MatchDetail = {
      ...teamed(),
      status: "completed",
      server: {
        serverName: "CS2 #1",
        scoreA: 13,
        scoreB: 13,
        winner: null,
        resultSource: "server",
        liveAt: "2026-11-05T12:05:00.000Z",
        completedAt: "2026-11-05T12:50:00.000Z",
      },
    };
    const stat = (playerId: string, name: string, team: "A" | "B", kills: number) => ({
      playerId,
      name,
      team,
      kills,
      deaths: 10,
      assists: 2,
      damage: 2000,
      roundsPlayed: 26,
      adr: 76.9,
      headshotPercent: 40,
      headshotKills: 6,
      multiKills: { 2: 1, 3: 0, 4: 0, 5: 0 },
      clutches: 0,
      firstKills: 0,
      firstDeaths: 0,
      tradeKills: 0,
      mvp: 1,
    });
    (fetchViewerMatch as jest.Mock).mockResolvedValue({
      ...viewer({}, done),
      stats: [stat("a", "阿強", "A", 15), stat("c", "訪客C", "B", 12)],
    });
    await renderMatch();
    const panel = screen.getByRole("region", { name: "比賽" });
    expect(panel).toHaveTextContent("平手");
    // Each player's numbers sit beside them in their team's column.
    const teamA = screen.getByRole("region", { name: "A 隊" });
    expect(within(teamA).getByText("阿強").closest("li")).toHaveTextContent(
      "15 / 10 / 2（擊殺／死亡／助攻）・ADR 76.9・爆頭 40%",
    );
    const teamB = screen.getByRole("region", { name: "B 隊" });
    expect(within(teamB).getByText("訪客C").closest("li")).toHaveTextContent("12 / 10 / 2");
    expect(within(teamB).getByText("小明").closest("li")).not.toHaveTextContent("ADR");
  });
});
