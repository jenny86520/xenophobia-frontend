import { render, screen, within } from "@testing-library/react";
import type { Milestone } from "@/types/about";
import { Archive } from "./archive";

const milestone = (id: string, date: string, title: string): Milestone => ({ id, date, title, description: "d" });

/** Each timeline row as its date plus the titles listed under it. */
function renderedRows() {
  return within(screen.getByRole("list"))
    .getAllByRole("listitem")
    .map((row) => ({
      dates: [...row.querySelectorAll("time")].map((time) => time.textContent),
      titles: within(row)
        .getAllByRole("heading", { level: 3 })
        .map((heading) => heading.textContent),
    }));
}

describe("Archive (milestones)", () => {
  it("puts consecutive milestones on the same date in one row with the date shown once", () => {
    render(
      <Archive
        index={4}
        milestones={[
          milestone("a", "2023", "網站發想"),
          milestone("b", "2023", "賽事舉辦"),
          milestone("c", "2025", "兩週年"),
        ]}
      />,
    );

    expect(renderedRows()).toEqual([
      { dates: ["2023"], titles: ["網站發想", "賽事舉辦"] },
      { dates: ["2025"], titles: ["兩週年"] },
    ]);
  });

  it("keeps the same date in separate rows when another date sits between them", () => {
    render(
      <Archive
        index={4}
        milestones={[milestone("a", "2024", "A"), milestone("b", "2025", "B"), milestone("c", "2024", "C")]}
      />,
    );

    expect(renderedRows().map((row) => row.dates)).toEqual([["2024"], ["2025"], ["2024"]]);
  });

  it("renders milestones in the order the backend sent", () => {
    render(<Archive index={4} milestones={[milestone("n", "2025", "Newest"), milestone("o", "2023", "Oldest")]} />);

    expect(screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual(["Newest", "Oldest"]);
  });

  it("does not make the rows focusable", () => {
    render(<Archive index={4} milestones={[milestone("a", "2024", "A"), milestone("b", "2024", "B")]} />);

    const row = screen.getByRole("listitem");
    expect(row).not.toHaveAttribute("tabindex");
    expect(row.querySelectorAll("a, button, [tabindex]")).toHaveLength(0);
  });
});
