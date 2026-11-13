import { render, screen, within } from "@testing-library/react";
import { LegendPodium } from "./legend-podium";

const entries = [
  { rank: 1, nickname: "阿明", points: 29 },
  { rank: 2, nickname: "小華", points: 18 },
  { rank: 3, nickname: "小美", points: 12 },
];

const stepOf = (name: string) => screen.getByText(name).closest("li") as HTMLElement;

describe("LegendPodium", () => {
  it("lists places in order but lays them out 2-1-3 with gold, silver and bronze trophies, large to small", () => {
    render(<LegendPodium title="傳奇總榜" entries={entries} />);

    const steps = within(screen.getByRole("list", { name: "傳奇總榜前三名" })).getAllByRole("listitem");
    expect(steps.map((step) => step.textContent)).toEqual([
      "第 1 名阿明29 PTS01",
      "第 2 名小華18 PTS02",
      "第 3 名小美12 PTS03",
    ]);
    expect(stepOf("小華")).toHaveClass("col-start-1");
    expect(stepOf("阿明")).toHaveClass("col-start-2");
    expect(stepOf("小美")).toHaveClass("col-start-3");

    const trophy = (name: string) => stepOf(name).querySelector("svg") as SVGElement;
    expect(trophy("阿明")).toHaveClass("text-gold", "size-20");
    expect(trophy("小華")).toHaveClass("text-silver", "size-14");
    expect(trophy("小美")).toHaveClass("text-bronze", "size-10");
    expect(trophy("阿明")).toHaveAttribute("aria-hidden", "true");
  });

  it("pops the trophies up in place order", () => {
    render(<LegendPodium title="傳奇總榜" entries={entries} />);

    expect(stepOf("阿明").style.getPropertyValue("--pop-order")).toBe("0");
    expect(stepOf("小華").style.getPropertyValue("--pop-order")).toBe("1");
    expect(stepOf("小美").style.getPropertyValue("--pop-order")).toBe("2");
  });

  it("puts tied members on one step and leaves the skipped place empty", () => {
    render(
      <LegendPodium
        title="傳奇總榜"
        entries={[
          { rank: 1, nickname: "阿明", points: 20 },
          { rank: 1, nickname: "小華", points: 20 },
          { rank: 3, nickname: "小美", points: 12 },
        ]}
      />,
    );

    const steps = within(screen.getByRole("list", { name: "傳奇總榜前三名" })).getAllByRole("listitem");
    expect(steps.map((step) => step.textContent)).toEqual(["第 1 名阿明、小華20 PTS01", "第 3 名小美12 PTS03"]);
    expect(steps[1]).toHaveClass("col-start-3");
  });
});

describe("LegendPodium titles", () => {
  it("shows a member's equipped title under their nickname", () => {
    render(
      <LegendPodium
        title="傳奇總榜"
        entries={[
          {
            rank: 1,
            nickname: "阿明",
            points: 29,
            memberTitle: { template: "title.basic", params: { text: "派對常客", textColor: "#ffd166" }, imageUrl: null },
          },
          { rank: 2, nickname: "小華", points: 18, memberTitle: null },
        ]}
      />,
    );
    expect(stepOf("阿明")).toHaveTextContent("稱號：派對常客");
    expect(stepOf("小華")).not.toHaveTextContent("稱號");
  });
});
