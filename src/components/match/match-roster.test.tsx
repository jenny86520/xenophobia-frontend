import { render, screen } from "@testing-library/react";
import type { MatchDetail, MatchPlayer } from "@/types/match";
import { MatchRoster } from "./match-roster";

const player = (playerId: string, name: string, extra: Partial<MatchPlayer> = {}): MatchPlayer => ({
  playerId,
  name,
  team: null,
  isCaptain: false,
  joinedAt: "2026-11-13T12:00:00Z",
  ...extra,
});

describe("MatchRoster cosmetics", () => {
  it("frames a member's row and shows their title; a guest gets neither", () => {
    const match = {
      entries: [
        {
          id: "e1",
          isGroup: false,
          ownerPlayerId: "p1",
          players: [
            player("p1", "阿明", {
              memberTitle: { template: "title.basic", params: { text: "內戰鐵人", textColor: "#ffffff" }, imageUrl: null },
              frame: {
                template: "frame.pulse",
                params: { mainColor: "#00e5ff", accentColor: "#ff3df0", speed: "medium" },
                imageUrl: null,
              },
            }),
          ],
        },
        { id: "e2", isGroup: false, ownerPlayerId: "p2", players: [player("p2", "訪客甲", { memberTitle: null, frame: null })] },
      ],
    } as unknown as MatchDetail;

    render(<MatchRoster match={match} />);

    const ming = screen.getByText("阿明").closest("li") as HTMLElement;
    expect(ming).toHaveAttribute("data-frame", "frame.pulse");
    expect(ming).toHaveClass("frame-pulse");
    expect(ming.style.getPropertyValue("--skin-speed")).toBe("2.5s");
    expect(ming).toHaveTextContent("稱號：內戰鐵人");

    const guest = screen.getByText("訪客甲").closest("li") as HTMLElement;
    expect(guest).not.toHaveAttribute("data-frame");
    expect(guest).not.toHaveTextContent("稱號");
  });
});
