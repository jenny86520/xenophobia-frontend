import { render, screen } from "@testing-library/react";
import { PartyRow } from "./party-row";
import type { PartyListItem, PartySummary } from "@/types/party";

const partySummary: PartySummary = {
  id: "1",
  title: "Night of Strategy",
  summary: "Strategy-focused game night.",
  category: "games",
  format: "offline",
  startDate: "2026-09-30",
  startTime: "18:30",
  coverUrl: null,
};

const partyListItem: PartyListItem = {
  id: "1",
  title: "Night of Strategy",
  description: "A tabletop evening.",
  category: "games",
  format: "offline",
  status: "active",
  startDate: "2026-09-30",
  startTime: "18:30",
  location: "Red Room Studio, Taipei",
  summary: "Strategy-focused game night.",
  coverUrl: null,
};

describe("PartyRow", () => {
  it("renders the home-page usage without a lifecycle badge and shows date + time", () => {
    render(<PartyRow party={partySummary} showLifecycleBadge={false} metaFields="date-time" />);

    expect(screen.queryByText("ACTIVE")).not.toBeInTheDocument();
    expect(screen.queryByText("ENDED")).not.toBeInTheDocument();
    expect(screen.getByText("2026-09-30")).toBeInTheDocument();
    expect(screen.getByText("18:30")).toBeInTheDocument();
  });

  it("renders the party-list usage with a lifecycle badge and shows date + category", () => {
    render(<PartyRow party={partyListItem} showLifecycleBadge={true} metaFields="date-category" />);

    expect(screen.getByText("ACTIVE")).toBeInTheDocument();
    expect(screen.getByText("2026-09-30")).toBeInTheDocument();
    expect(screen.getAllByText("games").length).toBeGreaterThan(0);
  });

  it("draws the cover as a backdrop hidden from assistive technology and keeps the row one link", () => {
    const { container } = render(
      <ul>
        <PartyRow
          party={{ ...partyListItem, coverUrl: "/media/images/cover.png" }}
          showLifecycleBadge={true}
          metaFields="date-category"
        />
      </ul>,
    );

    const backdrop = container.querySelector("[data-cover-backdrop]") as HTMLElement;
    expect(backdrop).toHaveAttribute("aria-hidden", "true");
    const image = backdrop.querySelector("img") as HTMLImageElement;
    expect(image).toHaveAttribute("alt", "");
    expect(image.getAttribute("src")).toMatch(/\/media\/images\/cover\.png$/);
    expect(backdrop.querySelector("[data-cover-scrim]")).toHaveClass("cover-scrim");
    expect(screen.queryByRole("img")).toBeNull();

    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute("href", "/party/1");
    expect(links[0]).toHaveTextContent("Night of Strategy");
  });

  it("has no backdrop without a cover", () => {
    const { container } = render(
      <ul>
        <PartyRow party={partySummary} showLifecycleBadge={false} metaFields="date-time" />
      </ul>,
    );

    expect(container.querySelector("[data-cover-backdrop]")).toBeNull();
    expect(container.querySelector("img")).toBeNull();
  });
});
