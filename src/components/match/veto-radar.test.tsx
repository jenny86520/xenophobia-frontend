import { render, screen } from "@testing-library/react";
import type { MatchVeto } from "@/types/match";
import { VetoRadar, VetoRadarLegend } from "./veto-radar";

const veto = (overrides: Partial<MatchVeto> = {}): MatchVeto => ({
  rule: "random",
  firstTeam: "A",
  firstReason: "random",
  stepSeconds: 30,
  startedAt: "2026-10-26T10:00:00.000Z",
  maps: [
    { key: "de_mirage", name: "Mirage", imageUrl: null, bannedBy: null, step: null, wins: { A: 3, B: 1 } },
    { key: "de_nuke", name: "Nuke", imageUrl: null, bannedBy: "B", step: 1, wins: { A: 0, B: 0 } },
    { key: "de_inferno", name: "Inferno", imageUrl: null, bannedBy: null, step: null, wins: { A: 0, B: 0 } },
  ],
  bans: [],
  turn: "A",
  step: 2,
  stepDeadline: null,
  overdue: false,
  finalMap: null,
  ...overrides,
});

describe("VetoRadar", () => {
  it("names both teams and their line styles in words, and says what the values are", () => {
    render(<VetoRadarLegend veto={veto()} teamNames={{ A: "紅龍", B: "B 隊" }} />);
    expect(screen.getByText("紅龍（實線）")).toBeInTheDocument();
    expect(screen.getByText("B 隊（虛線）")).toBeInTheDocument();
    expect(screen.getByText(/兩隊隊員在各地圖的贏場數加總/)).toBeInTheDocument();
  });

  it("keeps the drawing out of the accessibility tree and marks banned maps on it", () => {
    const { container } = render(<VetoRadar veto={veto()} />);
    expect(container.querySelector("[data-radar]")).toHaveAttribute("aria-hidden", "true");
    const nuke = container.querySelector('[data-map-label="de_nuke"]');
    expect(nuke).toHaveTextContent("Nuke ✕");
    expect(nuke).toHaveClass("line-through");
    // Around the map cards (a wide veto panel) the corner names hide.
    expect(nuke).toHaveClass("@xl:hidden");
    expect(container.querySelector('[data-map-label="de_mirage"]')).not.toHaveClass("line-through");
  });

  it("pushes team A out further where it has more wins", () => {
    const { container } = render(<VetoRadar veto={veto()} />);
    const [teamB, teamA] = Array.from(container.querySelectorAll("polygon")).slice(-2);
    // Mirage is the first axis, straight up: A (3 of 3) reaches the top, B (1 of 3) a third of the way.
    expect(teamA.getAttribute("points")?.split(" ")[0]).toBe("100,0");
    expect(teamB.getAttribute("points")?.split(" ")[0]).toBe("100,66.67");
  });

  it("names the map played once decided", () => {
    render(
      <VetoRadarLegend
        veto={veto({ finalMap: { key: "de_mirage", name: "Mirage", imageUrl: null } })}
        teamNames={{ A: "A 隊", B: "B 隊" }}
      />,
    );
    expect(screen.getByText(/比賽地圖為 Mirage/)).toBeInTheDocument();
  });
});
