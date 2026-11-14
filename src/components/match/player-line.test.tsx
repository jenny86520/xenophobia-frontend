import { render, screen } from "@testing-library/react";
import { PlayerLineItems } from "./player-line";

describe("PlayerLineItems", () => {
  it("keeps the name on the left and lines up whatever wraps on the right", () => {
    render(
      <PlayerLineItems
        player={{
          name: "Dragonfly",
          isCaptain: true,
          memberTitle: { template: "title.basic", params: { text: "手槍俠", textColor: "#ffffff" }, imageUrl: null },
          iceShowcase: [{ id: "i1", serial: 1, cup: null, issuerName: "管理員" }],
        }}
        idPrefix="team-p1"
        rating={976}
      />,
    );

    const name = screen.getByText("Dragonfly").closest("span") as HTMLElement;
    expect(name).toHaveClass("mr-auto");
    const line = name.parentElement as HTMLElement;
    expect(line).toHaveClass("flex-wrap", "justify-end");
    expect(line).toHaveTextContent(/隊長Dragonfly.*手槍俠.*976$/);
    expect(screen.getByText("976")).toHaveClass("whitespace-nowrap");
    expect(screen.getByRole("button", { name: "冰炫風 #1" })).toBeInTheDocument();
  });

  it("leaves the rating out for visitors", () => {
    render(<PlayerLineItems player={{ name: "訪客甲" }} idPrefix="x" />);
    expect(screen.getByText("訪客甲").parentElement).not.toHaveTextContent(/\d/);
  });
});
