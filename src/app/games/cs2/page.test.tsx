import { render, screen, within } from "@testing-library/react";
import { fetchScrimLadder } from "@/lib/player-actor";
import { fetchRecentScrims } from "@/lib/public-content-client";
import type { CompletedMatch } from "@/types/match";
import Cs2GamePage from "./page";

jest.mock("@/lib/player-actor", () => ({ fetchScrimLadder: jest.fn() }));
jest.mock("@/lib/public-content-client", () => ({ fetchRecentScrims: jest.fn() }));

const result: CompletedMatch = {
  id: "m1",
  title: "週五晚場",
  party: null,
  mapName: "Inferno",
  teams: { A: "紅龍", B: "B 隊" },
  scoreA: 13,
  scoreB: 9,
  winner: "A",
  completedAt: "2026-11-06T13:00:00.000Z",
};

beforeEach(() => {
  jest.clearAllMocks();
  (fetchRecentScrims as jest.Mock).mockResolvedValue([result]);
});

describe("/games/cs2", () => {
  it("shows signed-in people the ladder and everyone the latest results", async () => {
    (fetchScrimLadder as jest.Mock).mockResolvedValue([
      { place: 1, playerId: "a", name: "阿強", rating: 1050, matches: 2, wins: 2 },
      { place: 2, playerId: "b", name: "小明", rating: 1000, matches: 2, wins: 1 },
      { place: 2, playerId: "c", name: "訪客C", rating: 1000, matches: 1, wins: 0 },
    ]);
    render(await Cs2GamePage());

    const ladder = screen.getByRole("table", { name: "評分排行" });
    const rows = within(ladder).getAllByRole("row").slice(1);
    expect(rows.map((row) => row.textContent)).toEqual(["1阿強105022", "2小明100021", "2訪客C100010"]);

    const results = screen.getByRole("list", { name: "最近的比賽" });
    const row = within(results).getByRole("link", { name: /週五晚場/ });
    expect(row).toHaveAttribute("href", "/matches/m1");
    expect(row).toHaveTextContent("紅龍13 : 9B 隊");
    expect(row).toHaveTextContent("紅龍獲勝");
    expect(row).toHaveTextContent("Inferno");
  });

  it("tells visitors to sign in for the ladder and still shows the results", async () => {
    (fetchScrimLadder as jest.Mock).mockResolvedValue(null);
    render(await Cs2GamePage());

    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.getByText(/評分只給已登入的人看/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /以 Steam 登入/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "會員登入" })).toHaveAttribute("href", "/member/login");
    expect(within(screen.getByRole("list", { name: "最近的比賽" })).getAllByRole("listitem")).toHaveLength(1);
  });

  it("says when nothing has been rated or finished yet", async () => {
    (fetchScrimLadder as jest.Mock).mockResolvedValue([]);
    (fetchRecentScrims as jest.Mock).mockResolvedValue([]);
    render(await Cs2GamePage());
    expect(screen.getByText(/還沒有已計分的場次/)).toBeInTheDocument();
    expect(screen.getByText("還沒有完成的比賽。")).toBeInTheDocument();
  });
});
