import { fireEvent, render, screen } from "@testing-library/react";
import { EditorialList } from "./editorial-list";
import { ArchiveTimeline } from "./archive-timeline";

const items = [
  {
    id: "1",
    title: "Valorant",
    summary: "5v5 tactical shooter",
    description: "Weekly scrims.",
    placeholderKey: "game.1",
  },
  {
    id: "2",
    title: "Apex Legends",
    summary: "",
    description: "",
    placeholderKey: "game.2",
  },
];

describe("EditorialList", () => {
  // jsdom does not turn Enter / Space into a click; asserting a native <button> is what
  // guarantees keyboard activation in browsers (verified for real with Playwright in task 9.1).
  it("uses native buttons that expand and collapse", () => {
    render(<EditorialList items={items} summaryLabel="遊戲短述" descriptionLabel="遊戲說明" />);

    const trigger = screen.getByRole("button", { name: /Valorant/ });
    expect(trigger.tagName).toBe("BUTTON");
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Weekly scrims.")).toBeVisible();

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("shows placeholders when a summary or description is empty", () => {
    const { container } = render(<EditorialList items={items} summaryLabel="遊戲短述" descriptionLabel="遊戲說明" />);

    fireEvent.click(screen.getByRole("button", { name: /Apex Legends/ }));
    expect(container.querySelector('[data-placeholder="game.2.description"]')).not.toBeNull();
    expect(screen.getByText("待提供：遊戲說明")).toBeInTheDocument();
    expect(container.querySelector('[data-placeholder="game.2.summary"]')).not.toBeNull();
  });

  it("numbers rows from 01", () => {
    render(<EditorialList items={items} summaryLabel="遊戲短述" descriptionLabel="遊戲說明" />);
    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText("02")).toBeInTheDocument();
  });
});

describe("ArchiveTimeline", () => {
  it("renders markers in the order given", () => {
    render(
      <ArchiveTimeline
        items={[
          { id: "a", marker: "2024", title: "成立" },
          { id: "b", marker: "2019", title: "第一場" },
          { id: "c", marker: "2026", title: "改版" },
        ]}
      />,
    );

    const markers = screen.getAllByRole("listitem").map((li) => li.querySelector("time")?.textContent);
    expect(markers).toEqual(["2024", "2019", "2026"]);
  });
});
