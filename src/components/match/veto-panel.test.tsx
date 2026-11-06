import { render, screen, within } from "@testing-library/react";
import type { MatchVeto } from "@/types/match";
import { VetoPanel } from "./veto-panel";

jest.mock("next/navigation", () => ({ useRouter: () => ({ refresh: jest.fn() }) }));
jest.mock("@/app/matches/actions", () => ({ captainBanAction: jest.fn() }));

const veto = (overrides: Partial<MatchVeto> = {}): MatchVeto => ({
  rule: "weaker_first",
  firstTeam: "B",
  firstReason: "b-lower",
  stepSeconds: 30,
  startedAt: "2026-10-26T10:00:00.000Z",
  maps: [
    { key: "de_ancient", name: "Ancient", imageUrl: "/media/images/a.jpg", bannedBy: "B", step: 1, wins: { A: 0, B: 2 } },
    { key: "de_mirage", name: "Mirage", imageUrl: "/media/images/m.jpg", bannedBy: null, step: null, wins: { A: 3, B: 1 } },
    { key: "de_nuke", name: "Nuke", imageUrl: null, bannedBy: null, step: null, wins: { A: 0, B: 0 } },
  ],
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
const names = { A: "紅龍", B: "B 隊" };

function renderPanel(props: { canBan?: boolean; veto?: MatchVeto; status?: "veto_active" | "veto_complete" } = {}) {
  return render(
    <VetoPanel
      matchId="m1"
      status={props.status ?? "veto_active"}
      veto={props.veto ?? veto()}
      canBan={props.canBan ?? false}
      teamNames={names}
    />,
  );
}

describe("VetoPanel", () => {
  it("says who bans first, whose turn it is by team name, and the history", () => {
    renderPanel();
    expect(screen.getByText(/先手：/).closest("p")).toHaveTextContent(
      "先手：B 隊（B 隊總分較低，規則為總分低的隊伍先手）",
    );
    expect(screen.getByRole("status")).toHaveTextContent("輪到 紅龍・第 2 步");
    expect(screen.getByRole("status")).toHaveTextContent("時間到，即將隨機 Ban");
    expect(screen.getByText("第 1 步・B 隊 Ban Ancient")).toBeInTheDocument();
    expect(screen.getByText("阿凱（管理者隨機 Ban）")).toBeInTheDocument();
  });

  it("lists each map with both teams' wins and leaves the maps left without a word for others", () => {
    const { container } = renderPanel();
    const list = screen.getByRole("list", { name: "地圖" });
    const card = (key: string) => container.querySelector(`[data-map="${key}"]`) as HTMLElement;
    expect(card("de_mirage")).toHaveTextContent("紅龍 3・B 隊 1");
    expect(card("de_ancient")).toHaveTextContent("B 隊 Ban（第 1 步）");
    expect(within(list).queryByText("可選")).not.toBeInTheDocument();
    expect(card("de_mirage")).toHaveTextContent(/^Mirage紅龍 3・B 隊 1$/);
    // From @xl of the panel, each card sits towards its radar corner (the first one straight up).
    expect(card("de_ancient")).toHaveClass("@xl:absolute");
    expect(card("de_ancient").style.getPropertyValue("--x")).toBe("50%");
    expect(card("de_ancient").style.getPropertyValue("--y")).toBe("13%");
    expect(within(list).queryByRole("button")).not.toBeInTheDocument();
    // Images are decorative; banned ones turn grey.
    expect(within(list).queryByRole("img")).not.toBeInTheDocument();
    expect(card("de_ancient").querySelector("img")).toHaveClass("grayscale");
    expect(card("de_nuke").querySelector("[data-map-fallback]")).not.toBeNull();
  });

  it("gives the captain whose turn it is a Ban button on each map left", () => {
    renderPanel({ canBan: true });
    expect(screen.getByText("輪到你的隊伍，請選一張地圖 Ban。")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ban Mirage" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ban Nuke" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Ban Ancient" })).not.toBeInTheDocument();
  });

  it("shows the map played and the radar once decided", () => {
    const { container } = renderPanel({
      status: "veto_complete",
      veto: veto({
        turn: null,
        step: null,
        stepDeadline: null,
        overdue: false,
        finalMap: { key: "de_nuke", name: "Nuke", imageUrl: null },
      }),
    });
    expect(screen.getByText("比賽地圖：").closest("p")).toHaveTextContent("比賽地圖：Nuke");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(container.querySelector('[data-map="de_nuke"]')).toHaveTextContent("比賽地圖");
    expect(container.querySelector("[data-radar]")).not.toBeNull();
  });
});
