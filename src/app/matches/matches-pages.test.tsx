import { fireEvent, render, screen, within } from "@testing-library/react";
import MatchesPage from "./page";
import MatchPage from "./[id]/page";
import NewMatchPage from "./new/page";
import { fetchManagedMatch, fetchViewerMatch } from "@/lib/player-actor";
import { fetchMatchDetail, fetchMatches, fetchPartyList } from "@/lib/public-content-client";
import { fetchMemberProfile } from "@/lib/member-session";
import type { ManagedMatch, MatchDetail, ViewerMatch } from "@/types/match";

const NOT_FOUND = new Error("NEXT_NOT_FOUND");
jest.mock("next/navigation", () => ({
  notFound: () => {
    throw NOT_FOUND;
  },
}));
jest.mock("@/lib/player-actor", () => ({ fetchViewerMatch: jest.fn(), fetchManagedMatch: jest.fn() }));
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
      "unlockAction",
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
  entries: [
    { id: "e1", isGroup: true, ownerPlayerId: "a", players: [player("a", "阿強"), player("b", "小明")] },
    { id: "e2", isGroup: false, ownerPlayerId: "c", players: [player("c", "訪客C")] },
  ],
  teams: null,
  lockedAt: null,
  confirmedAt: null,
  cancelledAt: null,
};

const withRatings = (match: MatchDetail): MatchDetail => ({
  ...match,
  entries: match.entries.map((entry) => ({
    ...entry,
    players: entry.players.map((p, i) => ({ ...p, rating: 1000 + i * 100 })),
  })),
});

const viewer = (overrides: Partial<ViewerMatch["viewer"]> = {}, match: MatchDetail = base): ViewerMatch => ({
  ...withRatings(match),
  viewer: { playerId: "z", entryId: null, inviteCode: null, canManage: false, ...overrides },
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

  it("lists matches with status and head count", async () => {
    render(await MatchesPage());
    const row = screen.getByRole("link", { name: /週五晚場/ });
    expect(row).toHaveAttribute("href", "/matches/m1");
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

  it("shows the two teams with captains, totals and the difference once confirmed", async () => {
    const confirmed: MatchDetail = {
      ...base,
      status: "teams_confirmed",
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
      ],
      teams: {
        A: { playerIds: ["a"], captainId: "a", total: 1500, average: 1500 },
        B: { playerIds: ["b"], captainId: "b", total: 1400, average: 1400 },
        difference: 100,
      },
    };
    (fetchMatchDetail as jest.Mock).mockResolvedValue(confirmed);
    await renderMatch();
    const teamA = screen.getByRole("region", { name: "A 隊" });
    expect(within(teamA).getByText("阿強")).toBeInTheDocument();
    expect(within(teamA).getByText("隊長")).toBeInTheDocument();
    expect(within(teamA).getByText("總分 1500・平均 1500")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("名單已鎖定，不再開放報名。")).toBeInTheDocument();
  });

  it("gives the creating member the management tools for the status", async () => {
    (fetchViewerMatch as jest.Mock).mockResolvedValue(viewer({ canManage: true }));
    const managed: ManagedMatch = {
      ...withRatings(base),
      entries: withRatings(base).entries.map((e) => ({ ...e, inviteCode: e.isGroup ? "K7P2QM" : null })),
      createdBy: "會員host1",
      createdByMemberId: "host1",
      candidates: null,
    };
    (fetchManagedMatch as jest.Mock).mockResolvedValue(managed);
    await renderMatch();
    const manage = screen.getByRole("region", { name: "管理" });
    expect(within(manage).getByRole("button", { name: "鎖定名單" })).toBeInTheDocument();
    expect(within(manage).getByRole("button", { name: "從派對帶入" })).toBeInTheDocument();
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
  });
});
