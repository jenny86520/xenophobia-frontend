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

  it("shows a member's chosen ice creams in their row, a guest none", () => {
    const match = {
      entries: [
        {
          id: "e1",
          isGroup: false,
          ownerPlayerId: "p1",
          players: [
            player("p1", "阿明", {
              iceShowcase: [
                { id: "i20", serial: 20, cup: null, issuerName: "管理員" },
                { id: "i12", serial: 12, cup: null, issuerName: "阿明" },
              ],
            }),
          ],
        },
        { id: "e2", isGroup: false, ownerPlayerId: "p2", players: [player("p2", "訪客甲", { iceShowcase: [] })] },
      ],
    } as unknown as MatchDetail;

    render(<MatchRoster match={match} />);

    const ming = screen.getByText("阿明").closest("li") as HTMLElement;
    expect(
      Array.from(ming.querySelectorAll("[data-ice-showcase] button")).map((b) => b.getAttribute("aria-label")),
    ).toEqual(["冰炫風 #20", "冰炫風 #12"]);
    const guest = screen.getByText("訪客甲").closest("li") as HTMLElement;
    expect(guest.querySelector("[data-ice-showcase]")).toBeNull();
  });
});
